<template>
    <div :class="[$style.InputHint, classList]">
        <slot></slot>
    </div>
</template>

<script>
export default {
    name: 'InputHint',

    props: {
        /**
         * Определяет классы, которые будут модифицировать цвет
         */
        color: {
            type: String,
            default: 'base',
            validator: val => ['base', 'dark'].includes(val),
        },
    },

    computed: {
        classList() {
            return {
                [this.$style[`_${this.color}`]]: this.color,
            };
        },
    },
};
</script>

<style lang="scss" module>
    $grey-color: $grey;
    $alert-color: $error;
    $grey-light-color: $grey-middle;

    .InputHint {
        position: absolute;
        top: calc(100% + 4px);
        left: 0;
        width: 100%;
        font-size: 1.2rem;

        /* Colors */
        &._base {
            color: $grey-color;
        }

        &._dark {
            color: $grey-light-color;
        }

        @include respond-to(mobile) {
            font-size: 1.2rem;
        }
    }
</style>
