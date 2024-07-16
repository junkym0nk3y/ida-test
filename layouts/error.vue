<template>
    <div :class="$style.Error">
        <h1 :class="$style.title">
            <template v-if="error.statusCode === 404">
                Error 404
            </template>
            <template v-else>
                Что-то пошло <br> не так…
            </template>
        </h1>

        <h2 :class="$style.code">
            {{ error.statusCode }}
        </h2>
    </div>
</template>

<script>
export default {
    name: 'Error',

    layout: 'errorLayout',

    props: {
        error: {
            type: Object,
            default: () => ({}),
        },
    },
};
</script>

<style lang="scss" module>
    .Error {
        position: relative;
        overflow: hidden;
        display: flex;
        align-items: center;
        height: 100%;
        min-height: 72rem;
        padding-top: 6.4rem;
        padding-right: $aside-padding;
        padding-left: $aside-padding;
        text-align: center;
        flex-direction: column;
    }
</style>
