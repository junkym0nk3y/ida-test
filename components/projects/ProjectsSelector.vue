<template>
    <div :class="$style.ProjectsSelector">
        <ProjectsFilter
            :class="[$style.row, $style.projectFilter]"
            :facets="facets"
            :specs="specs"
            :values="values"
            @change="$emit('change', $event)"
        />

        <div :class="$style.row">
            <transition name="fade-fast">
                <VButton
                    v-show="values.propertyType === 'flat'"
                    :active="Boolean(values.complete)"
                    :class="[$style.filterButton, $style._desktop]"
                    :disabled="facets.complete && !facets.complete.includes('true')"
                    border
                    round
                    @click="$emit('change', {complete: values.complete ? '' : true})"
                >
                    Готовые квартиры
                </VButton>
            </transition>

            <VButton
                :class="[$style.filterButton, $style._mobile]"
                border
                round
                @click="$emit('open-modal')"
            >
                Открыть фильтр
            </VButton>

            <div :class="$style.filterButtonSep"></div>

            <div :class="[$style.resetBtn, {[$style._disabled]: !showResetBtn}]">
                <span @click="$emit('change', 'reset')">
                    Очистить фильтр
                    <svg-icon
                        :class="$style.resetIcon"
                        name="refresh"
                    />
                </span>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: 'ProjectsSelector',

    components: {
        ProjectsFilter: () => import('~/components/projects/ProjectsFilter'),
    },

    props: {
        values: {
            type: Object,
            default: () => ({}),
        },

        specs: {
            type: Object,
            default: () => ({}),
        },

        facets: {
            type: Object,
            default: () => ({}),
        },

        showResetBtn: Boolean,
    },
};
</script>

<style lang="scss" module>
    .FilterProjects {
        position: relative;
    }

    .row {
        position: relative;
        display: flex;
        align-items: baseline;
        flex-flow: row nowrap;
        min-height: 5rem;
        margin-bottom: 3.2rem;

        &:last-child {
            margin-bottom: 0;
        }
    }

    .projectFilter {
        display: flex;

        @include respond-to(tablet) {
            display: none;
        }
    }

    .filterButton {
        z-index: 1;

        &._desktop {
            display: inline-flex;

            @include respond-to(tablet) {
                display: none;
            }
        }

        &._mobile {
            display: none;

            @include respond-to(tablet) {
                display: inline-flex;
            }
        }
    }

    .filterButtonSep {
        flex: 1;
    }

    .resetBtn {
        position: absolute;
        visibility: visible;
        display: flex;
        justify-content: center;
        width: 100%;
        transition: all ease .3s;
        pointer-events: none;

        &._disabled {
            opacity: .3;

            span {
                cursor: default;
                pointer-events: none;
            }
        }

        span {
            display: flex;
            align-items: center;
            text-transform: capitalize;
            line-height: 1.2;
            transition: opacity .3s;
            cursor: pointer;
            user-select: none;
            pointer-events: all;

            &:hover {
                opacity: .7;
            }
        }

        .resetIcon {
            width: 1.6rem;
            height: 1.6rem;
            margin-left: .4rem;
        }

        @include respond-to(tablet) {
            visibility: hidden;
            display: none;
        }
    }
</style>
