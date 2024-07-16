<template>
    <div :class="$style.ProjectsLoader">
        <ProjectCard
            v-for="index in 6"
            :key="index"
            :class="$style.projectCard"
            is-loader
        />
    </div>
</template>

<script>
export default {
    components: {
        ProjectCard: () => import('~/components/projects/ProjectCard'),
    },
};
</script>

<style lang="scss" module>
    .ProjectsLoader {
        display: flex;
        flex-flow: row wrap;
        margin: -.8rem;
        padding-top: 1.6rem;

        @include respond-to(tablet) {
            margin: 0 0 2.4rem;
            padding: 0;
        }
    }

    .projectCard {
        pointer-events: none;

        &:nth-child(1),
        &:nth-child(6) {
            :global(.card-wrapper) {
                background: $grey-light;
            }
        }

        &:nth-child(3n+2) {
            :global(.card-wrapper) {
                background: #dae0e9;
            }
        }

        &:nth-child(3),
        &:nth-child(4) {
            :global(.card-wrapper) {
                background: $violet;
            }
        }
    }
</style>
