<template>
    <div :class="['page', $style.ProjectsFilterPage]">
        <div class="container">
            <h1 :class="$style.counter">
                Проекты
                <span>{{ counter }}</span>
            </h1>

            <ProjectsSelector
                :facets="facets"
                :show-reset-btn="isShowReset"
                :specs="specs"
                :values="values"
                @change="onFilterChange"
                @open-modal="handleOpenModal"
            />

            <div
                v-if="items && items.length"
                :class="[$style.projectsWrapper, {[$style._reload] : isReloadActive}]"
            >
                <!-- Список проектов по фильтру -->
                <div
                    :class="[$style.projectsList, {[$style._reload]: isReloadActive}]"
                >
                    <ProjectCard
                        v-for="(project, index) in items"
                        :key="`${index}_project`"
                        :project="project"
                    />
                </div>

                <!-- Loader -->
                <transition
                    mode="in-out"
                    name="fade-fast"
                >
                    <div
                        v-if="view === 'list' && isReloadActive"
                        :class="$style.listWrapper"
                    >
                        <ProjectsLoader />
                    </div>
                </transition>
            </div>
        </div>
    </div>
</template>

<script>
// Utils
import { applyQuery, objectToQuery, updateQuery } from '~/assets/js/utils/query-utils';
import { prepareSpecs } from '~/assets/js/utils/filter-utils';

// Modals
const ModalFilterProjects = () => import('~/components/modals/ModalFilterProjects');

// Constants
const defaultValues = {
    propertyType: '',
    zone: '',
    complete: '',
    price_max: '',
    price_min: '',
    deadlineYear: '',
};

// Update specs by keys
const arrUpdateSpecs = ['zone', 'propertyType'];

// Reset values by keys
const arrResetValues = ['zone'];

/**
 * @version 1.0.2
 * @displayName ProjectsFilterPage
 */
export default {
    name: 'ProjectsFilterPage',

    components: {
        ProjectsSelector: () => import('~/components/projects/ProjectsSelector'),
        ProjectsLoader: () => import('~/components/projects/ProjectsLoader'),
        ProjectCard: () => import('~/components/projects/ProjectCard'),
    },

    async asyncData({ app, query }) {
        // Предфильтрация доступных параметров
        const queryValues = Object.fromEntries(Object.entries(query)
            .filter(([key]) => Object.keys(defaultValues)
                .includes(key)));

        const values = applyQuery(defaultValues, queryValues);

        try {
            const [projectsRes, specsRes, facetsRes] = await Promise.all([
                app.$axios.$get(app.$api.projects.list, {
                    params: values,
                    paramsSerializer: params => objectToQuery(params),
                }),

                // Фильтруем спеки, для query
                app.$axios.$get(app.$api.projects.specs, {
                    params: Object.fromEntries(Object.entries(values)
                        .filter(([key]) => arrUpdateSpecs.includes(key))),
                    paramsSerializer: params => objectToQuery(params),
                }),
                app.$axios.$get(app.$api.projects.facets, {
                    params: values,
                    paramsSerializer: params => objectToQuery(params),
                }),
            ]);

            return {
                items: projectsRes || [],
                facets: prepareSpecs(facetsRes) || {},
                specs: prepareSpecs(specsRes) || {},
                count: projectsRes?.length || 0,
                counter: projectsRes?.length || 0,
                values,
            };
        } catch (err) {
            console.warn('[MainPage/asyncData] request failed: ', err);
        }
    },

    data() {
        return {
            specs: {},
            facets: {},
            items: [],
            values: { ...defaultValues },
            count: 0,
            counter: 0,
            isReloadActive: true,
            view: 'list',
        };
    },

    computed: {
        // Проверка на отображение кнопки сброса
        isShowReset() {
            return JSON.stringify(this.values) !== JSON.stringify(defaultValues);
        },
    },

    watch: {
        // Каунтер с анимацией
        count(newCount, oldCount) {
            this.counter = Math.ceil(newCount);
        },
    },

    mounted() {
        setTimeout(() => {
            this.isReloadActive = false;
        }, 600);
    },

    methods: {
        // Обновление фильтра
        async onFilterChange(val) {
            if (val === 'reset') {
                await this.handleReset();
                return;
            }

            const valueKey = Object.keys(val)[0];

            // Проверка, требуется ли обновлять specs
            const isUpdateSpecs = arrUpdateSpecs.includes(valueKey) || arrResetValues.includes(valueKey);

            // Сбрасываем values до дефолтовых, если требуется
            if (arrResetValues.includes(valueKey)) {
                this.values = { ...defaultValues, ...val };
            } else {
                this.values = { ...this.values, ...val };
            }

            // Удаляем ненужные параметры на условие
            if (this.values.complete && this.values.propertyType !== 'flat') {
                this.values.complete = '';
            }

            await this.handleUpdateItems(isUpdateSpecs);
        },

        // Модалька фильтра с отслеживанием изменений
        async handleOpenModal() {
            this.$modal.open(ModalFilterProjects, {
                specs: this.specs,
                facets: this.facets,
                values: this.values,
                count: this.count,
                isReloadActive: this.isReloadActive,
                isShowReset: this.isShowReset,
            });

            this.$modal.event.$on('change', async val => {
                await this.onFilterChange(val);

                this.$nextTick(() => {
                    this.$modal.update({
                        specs: this.specs,
                        facets: this.facets,
                        values: this.values,
                        count: this.count,
                        isReloadActive: this.isReloadActive,
                        isShowReset: this.isShowReset,
                    });
                });
            });
        },

        async handleReset() {
            this.values = { ...defaultValues };
            await this.handleUpdateItems(true);
        },

        async handleUpdateItems(updateSpecs = false) {
            this.isReloadActive = true;
            const start = Date.now();

            const [projectsRes, facetsRes] = await Promise.all([
                this.handleFetchItems(),
                this.handleFetchFacets(),
            ]);

            if (updateSpecs) {
                const specsRes = await this.handleFetchSpecs();
                this.specs = prepareSpecs(specsRes) || {};
            }

            this.items = projectsRes || [];
            this.count = this.items.length || 0;
            this.facets = prepareSpecs(facetsRes) || {};

            const longLoad = Date.now() - start > 600;

            setTimeout(() => {
                this.$nextTick(() => {
                    this.isReloadActive = false;
                    updateQuery(this.values, this.$route);
                });
            }, longLoad ? 0 : 600);
        },

        async handleFetchItems() {
            try {
                const resp = await this.$axios.$get(this.$api.projects.list, {
                    params: this.values,
                    paramsSerializer: params => objectToQuery(params),
                });
                return resp || [];
            } catch (err) {
                console.warn('[projectsPage/handleFetchItems] request failed: ', err);
            }
        },

        async handleFetchSpecs() {
            try {
                const resp = await this.$axios.$get(this.$api.projects.specs, {
                    params: this.values,
                    paramsSerializer: params => objectToQuery(params),
                });
                return resp || [];
            } catch (err) {
                console.warn('[projectsPage/handleFetchSpecs] request failed: ', err);
            }
        },

        async handleFetchFacets() {
            try {
                const resp = await this.$axios.$get(this.$api.projects.facets, {
                    params: this.values,
                    paramsSerializer: params => objectToQuery(params),
                });
                return resp || [];
            } catch (err) {
                console.warn('[projectsPage/handleFetchFacets] request failed: ', err);
            }
        },
    },
};
</script>

<style lang="scss" module>
    .ProjectsFilterPage {
        //
    }

    .counter {
        margin-top: 6.4rem;
        margin-bottom: 3.2rem;
        text-transform: uppercase;
        font-family: $additional-font;
        font-size: 4rem;
        font-weight: 600;

        span {
            color: $violet;
        }
    }

    .projectsWrapper {
        position: relative;
        margin: 3.2rem 0;
        padding-bottom: 6.4rem;

        &._reload {
            min-height: calc(100vh + 3.2rem);

            @include respond-to(mobile) {
                min-height: calc(135vh + 3.2rem);
            }
        }
    }

    .listWrapper {
        position: absolute;
        top: .8rem;
        left: 0;
        width: 100%;
        height: 100%;

        @include respond-to(tablet) {
            top: 0;
        }
    }

    .projectsList {
        display: flex;
        flex-flow: row wrap;
        margin: -.8rem;
        padding-top: 1.6rem;
        opacity: 1;

        /* отключаем переход по ссылке, для демки */

        pointer-events: none;

        @include respond-to(tablet) {
            margin: 0 0 2.4rem;
            padding: 0;
        }

        &._reload {
            opacity: 0;
        }
    }
</style>
