<template>
    <component
        :is="tag"
        :data-test-id="name"
        :class="[$style.VButton, classList]"
        :disabled="disabled"
        v-bind="$attrs"
        @click="onClick"
        @mouseenter="onMouseEnter"
        @mouseleave="onMouseLeave"
    >
        <div
            v-if="$slots.default"
            :class="$style.label"
        >
            <!-- @slot Контент внутри кнопки -->
            <slot></slot>
        </div>
    </component>
</template>

<script>
/**
 * Кастомная альтернатива тега button в стандартном html<br>
 * На проектах, обычно, имеет несколько цветов, форм и состояний.<br><br>
 * Область применения: ссылка, изменения состояния, вызов методов.
 *
 * @version 1.0.1
 * @displayName VButton
 */
export default {
    name: 'VButton',

    props: {
        /**
         * Имя поля нужно для тестов
         */
        name: {
            type: String,
            default: '',
        },

        /**
         * Определяет тег компонента
         */
        tag: {
            type: String,
            default: 'button',
            validator: v => [
                'n-link',
                'a',
                'span',
                'div',
                'button',
                'input',
            ].includes(v),
        },

        /**
         * Определяет классы, которые будут модифицировать размер
         */
        size: {
            type: String,
            default: 'medium',
            validator: value => ['small', 'medium'].includes(value),
        },

        /**
         * Определяет классы, которые будут модифицировать цвет
         */
        color: {
            type: String,
            default: 'base',
            validator: value => ['base', 'fill', 'dark', 'darkFill', 'black'].includes(value),
        },

        /**
         * Модификатор вида кнопки с бордером
         */
        border: {
            type: Boolean,
            default: true,
        },

        /**
         * Модификатор вида кнопки с округлением
         */
        round: Boolean,

        /**
         * Активное состояние кнопки
         */
        active: Boolean,

        /**
         * Это свойство отключает взаимодействие
         */
        disabled: Boolean,
    },

    computed: {
        classList() {
            return [{
                [this.$style[`_${this.color}`]]: this.color,
                [this.$style[`_${this.size}`]]: this.size,
                [this.$style._disabled]: this.disabled,
                [this.$style._active]: this.active,
                [this.$style._border]: this.border,
                [this.$style._round]: this.round,
            }];
        },
    },

    methods: {
        /**
         * Эмитит событие клика в родительский компонент
         * @param {Event} event mouse event
         * @public
         */
        onClick($event) {
            /**
             * Cобытие клика в родительский компонент
             * @event click
             * @param {Event} event mouse event
             */
            this.$emit('click', $event);
        },

        /**
         * Эмитит cобытие при наведении на элемент
         * @param {Event} event mouse event
         * @public
         */
        onMouseEnter($event) {
            /**
             * Cобытие при наведении на элемент
             * @event mouseenter
             * @param {Event} event mouse event
             */
            this.$emit('mouseenter', $event);
        },

        /**
         * Эмитит событие, когда наведение на элемент прекращено
         * @param {Event} event mouse event
         * @public
         */
        onMouseLeave($event) {
            /**
             * Cобытие, когда наведение на элемент прекращено
             * @event mouseleave
             * @param {Event} event mouse event
             */
            this.$emit('mouseleave', $event);
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

    .VButton {
        outline: none;
        transition: color $default-transition, opacity $default-transition, background-color $default-transition, border-color $default-transition;
        cursor: pointer;
        user-select: none;

        /* Modificators */
        &._border {
            overflow: hidden;
            border-style: solid;
            border-width: .1rem;
        }

        &._round {
            border-radius: 10rem;
        }

        &._disabled {
            pointer-events: none;
            opacity: .5;
        }

        &:hover {
            opacity: .7;
        }

        /* Sizes */
        &._small {
            .label {
                padding: 1rem 1.6rem;
            }
        }

        &._medium {
            .label {
                padding: 1.4rem 3.2rem;

                @include respond-to(mobile) {
                    padding: 1.2rem 3.2rem;
                }
            }
        }

        /* Colors */
        &._base {
            background-color: $base-white;

            .label {
                color: $base-black;
            }

            &._active {
                .label {
                    color: $base-color;
                }

                &._border {
                    border-color: $base-color;
                }
            }

            @include hover {
                &._border {
                    border-color: $base-color;
                }
            }
        }

        &._fill {
            background-color: $base-white;

            .label {
                color: $base-black;
            }

            &._active {
                background-color: $base-color;

                .label {
                    color: $base-white;
                }

                &._border {
                    border-color: $base-color;
                }
            }

            @include hover {
                &._border {
                    border-color: $base-color;
                }
            }
        }

        &._dark {
            border-color: $black-active;
            background-color: $base-black;

            .label {
                color: $base-white;
            }

            &._active {
                background-color: $black-active;

                .label {
                    color: $base-white;
                }

                &._border {
                    border-color: $black-active;
                }
            }

            @include hover {
                &._border {
                    border-color: $black-active;
                }
            }
        }

        &._darkFill {
            background-color: transparent;

            .label {
                color: $base-white;
            }

            &._border {
                border-color: $base-white;
            }

            &._active {
                background-color: $base-color;

                .label {
                    color: $base-white;
                }

                &._border {
                    border-color: $base-color;
                }
            }

            @include hover {
                background-color: $base-color;

                .label {
                    color: $base-white;
                }

                &._border {
                    border-color: $base-color;
                }
            }
        }

        &._black {
            background-color: $base-white;

            .label {
                color: $base-black;
            }

            &._active {
                background-color: $base-black;

                .label {
                    color: $base-white;
                }

                &._border {
                    border-color: $base-black;
                }
            }

            @include hover {
                &._border {
                    border-color: $base-black;
                }
            }
        }
    }

    .label {
        display: inline-flex;
        align-items: baseline;
        text-transform: uppercase;
        white-space: nowrap;
        font-size: 1.2rem;
        line-height: 1.2;
        letter-spacing: -.005em;
        transition: color $default-transition;

        svg {
            position: relative;
            top: .125em;
            display: inline-block;
            width: 1em;
            height: 1em;
            margin-left: .2em;
            vertical-align: center;
        }
    }
</style>
