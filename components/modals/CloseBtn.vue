<template>
    <button
        :class="$style.CloseBtn"
        @click="$emit('close')"
    >
        <svg-icon
            name="close"
        />
    </button>
</template>

<script>
export default {
    name: 'CloseBtn',

    methods: {
        close() {
            this.$emit('close');
        },
    },
};
</script>

<style lang="scss" module>
    $btn-back-color: $violet;

    .CloseBtn {
        z-index: 1;
        width: 8rem;
        height: 3rem;
        border-radius: 3rem;
        background: $btn-back-color;
        transition: opacity .3s;
        cursor: pointer;

        &:hover {
            opacity: .7;
        }

        svg {
            width: 2rem;
            height: 2rem;
        }
    }
</style>
