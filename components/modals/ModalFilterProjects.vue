<template>
    <div :class="$style.ModalFilterProjects">
        <div :class="$style.top">
            <div :class="$style.title">
                Фильтр проектов
            </div>

            <CloseBtn
                @close="$emit('close')"
            />
        </div>

        <ProjectsFilter
            :class="$style.projectFilter"
            :specs="specs"
            :facets="facets"
            :values="values"
            is-modal
            @change="$emit('change', $event)"
        />
    </div>
</template>

<script>
// Components
import ProjectsFilter from '~/components/projects/ProjectsFilter';
import CloseBtn from '~/components/modals/CloseBtn';

export default {
    name: 'ModalFilterProjects',

    components: {
        ProjectsFilter,
        CloseBtn,
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

        count: {
            type: Number,
            default: 7,
        },

        isShowReset: Boolean,
        isReloadActive: Boolean,
    },
};
</script>

<style lang="scss" module>
    .ModalFilterProjects {
        position: relative;
    }

    .top {
        display: flex;
        align-items: center;
        justify-content: space-between;
        height: 6.2rem;
        padding: 2rem;
        background: #000;
        color: #fff;
    }

    .projectFilter {
        padding: 2rem;
    }
</style>
