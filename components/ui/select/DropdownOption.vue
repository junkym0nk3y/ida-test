<template>
    <div
        :class="[$style.DropdownOption, classList]"
        @mouseenter="onMouseEnter"
        @mouseleave="onMouseLeave"
        @click="onClick"
    >
        {{ option[labelName] }}
    </div>
</template>

<script>
export default {
    name: 'DropdownOption',

    props: {
        option: {
            type: Object,
            required: true,
            default: () => ({}),
        },

        value: {
            type: [Number, String, Array],
            required: true,
        },

        /**
         * Название поля для value
         */
        valueName: {
            type: String,
            default: 'value',
        },

        /**
         * Название поля для label
         */
        labelName: {
            type: String,
            default: 'label',
        },

        /**
         * Определяет классы, которые будут модифицировать размер
         */
        size: {
            type: String,
            default: 'medium',
            validator: value => ['small', 'medium'].includes(value),
        },

        isHighlighted: Boolean,
    },

    computed: {
        isSelected() {
            if (Array.isArray(this.value)) {
                return this.value.includes(this.option[this.valueName]);
            } else {
                return this.value === this.option[this.valueName];
            }
        },

        classList() {
            return [
                {
                    [this.$style[`_${this.size}`]]: this.size,
                    [this.$style._highlighted]: this.isHighlighted,
                    [this.$style._selected]: this.isSelected,
                    [this.$style._disabled]: this.option.disabled,
                },
            ];
        },
    },

    methods: {
        onClick() {
            if (this.option.disabled) {
                return;
            }

            this.$emit('click', this.option);
        },

        onMouseEnter() {
            if (this.option.disabled) {
                return;
            }

            this.$emit('mouseenter');
        },

        onMouseLeave() {
            if (this.option.disabled) {
                return;
            }

            this.$emit('mouseleave');
        },
    },
};
</script>

<style lang="scss" module>
    $active-color: $violet;

    .DropdownOption {
        font-weight: 500;
        cursor: pointer;

        /* Sizes */
        &._small {
            padding: 1rem 2.4rem;
            font-size: 1.2rem;
            line-height: 1.2rem;
        }

        &._medium {
            padding: 1.2rem 3.2rem;
            font-size: 1.6rem;
            line-height: 1.2;
        }

        /* Modificators */
        &._highlighted {
            background-color: rgba($active-color, .3);
        }

        &._selected {
            color: $active-color;
        }

        &._disabled {
            opacity: .4;
            transition: $default-transition;
            cursor: not-allowed;
        }

        &._hidden {
            display: none;
        }
    }
</style>
