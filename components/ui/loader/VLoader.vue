<template>
    <div :class="[$style.UiLoader, classList]">
        <span :class="$style.circle"></span>
        <span :class="$style.circle"></span>
        <span :class="$style.circle"></span>
    </div>
</template>

<script>
export default {
    name: 'UiLoader',

    props: {
        color: {
            type: String,
            default: 'base',
            validate: v => ['base', 'white', 'dark'].includes(v),
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
    $base-black: $base-600;
    $base-white: #fff;

    /* Colors */
    // base
    $base-color: $violet;

    // Black
    $black-active: $base-100;

    .UiLoader {
        display: flex;
        align-items: center;
        justify-content: space-between;
        width: 5.4rem;
        height: 1.5rem;
        margin: 0 auto;

        &._white {
            .circle {
                background-color: $base-white;
            }
        }

        &._dark {
            .circle {
                background-color: $base-black;
            }
        }
    }

    .circle {
        width: .7rem;
        height: .7rem;
        border-radius: 50%;
        background-color: $base-color;
        animation-name: ui-loader-circle;
        animation-duration: 1.5s;
        animation-iteration-count: infinite;

        &:nth-child(2) {
            animation-delay: .5s;
        }

        &:last-child {
            animation-delay: 1s;
        }
    }

    @keyframes ui-loader-circle {
        0% {
            transform: scale(1);
        }

        33% {
            transform: scale(calc(2 + 1 / 7)) translateZ(0);
        }

        66% {
            transform: scale(1);
        }

        100% {
            transform: scale(1);
        }
    }
</style>
