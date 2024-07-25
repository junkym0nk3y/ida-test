<template>
    <nuxt-link
        :to="project && project.slug ? `/${project.slug}/` : ''"
    >
        <!-- #TODO: тут тебе необходимо будет проработать верстку карточки согласно макету,
                используя данные с пропса project-->
    </nuxt-link>
</template>

<script>
export default {
    name: 'ProjectCard',

    props: {
        project: {
            type: Object,
            default: () => ({}),
        },
    },
};
</script>

<style lang="scss" module>
    //
</style>
