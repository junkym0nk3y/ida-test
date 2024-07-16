<template>
    <div :class="['v-input', $style.VInputThousands, classList]">
        <div :class="['v-input__inner', $style.inner]">
            <input
                ref="input"
                :class="['v-input__native', $style.native]"
                v-bind="inputAttrs"
                :value="splittedValue"
                :name="name"
                :data-test-id="name"
                type="text"
                @keydown.enter="$refs.input.blur()"
                @input="onInput"
                @change="onChange"
                @focus="onFocus"
                @blur="onBlur"
            >
        </div>
    </div>
</template>

<script>
export default {
    name: 'VInputThousands',

    props: {
        value: {
            type: [String, Number],
            default: '',
        },

        /**
         * Имя поля нужно для тестов
         */
        name: {
            type: String,
            default: '',
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
            validator: val => ['base', 'dark'].includes(val),
        },

        disabled: Boolean,

        error: Boolean,

        delimiter: {
            type: String,
            default: ' ',
        },

        decimalMark: {
            type: String,
            default: '.',
        },

        decimalCount: {
            type: Number,
            default: 2,
        },

        length: {
            type: Object,
            default: () => ({ maxlength: null, minlength: null }),
        },
    },

    data() {
        return {
            isFocused: false,
            splittedValue: this.splitThousands(this.value),
        };
    },

    computed: {
        classList() {
            return {
                [this.$style[`_${this.color}`]]: this.color,
                [this.$style[`_${this.size}`]]: this.size,
                [this.$style._active]: this.isFocused,
                [this.$style._disabled]: this.disabled,
            };
        },

        inputAttrs() {
            let attrs = {
                ...this.$attrs,
            };

            if (this.disabled) {
                attrs.disabled = 'disabled';
            }

            if (Object.values(this.length).length) {
                attrs = {
                    ...attrs,
                    ...this.length,
                };
            }

            return attrs;
        },

        cleanValue() {
            return Number(this.splittedValue.split(this.delimiter)
                .join(''));
        },
    },

    watch: {
        value(newValue) {
            if (newValue !== this.cleanValue) {
                this.splittedValue = this.splitThousands(newValue);
            }
        },
    },

    methods: {
        onChange() {
            // strip any leading zeros
            if (this.splittedValue.length > 1 && this.splittedValue[0] === '0') {
                this.splittedValue = this.splitThousands(this.cleanValue.toString()
                    .replace(/^(-)?0+(?=\d)/, '$1'));
            }

            if (!this.splittedValue || this.splittedValue === '0') {
                this.splittedValue = this.splitThousands(this.defaultValue);
            }

            this.$nextTick(() => {
                this.$emit('change', this.cleanValue);
            });
        },

        onFocus(e) {
            this.isFocused = true;
            this.$emit('focus', e);
        },

        onBlur(e) {
            this.isFocused = false;
            this.onChange();
            this.$emit('blur', e);
        },

        onInput(e) {
            let endPos = e.target.selectionEnd;
            const oldValue = e.target.value;
            const newValue = this.splitThousands(e.target.value);
            e.target.value = newValue;
            this.splittedValue = newValue;

            this.$nextTick(() => {
                endPos = this.getNextCursorPosition(endPos, oldValue, newValue, this.delimiter);
                this.setCursor(e.target, endPos);
                this.$emit('input', this.cleanValue);
            });
        },

        splitThousands(value) {
            if (typeof value !== 'number' && typeof value !== 'string') {
                console.warn('[VInputThousands] Wrong prop value');
                return '';
            }

            let partDecimal = '';
            let parts;

            // strip alphabet letters
            value = value.toString();
            value = value
                .replace(/[A-Za-z]/g, '')
                // replace the first decimal mark with reserved placeholder
                .replace(this.decimalMark, 'M')

                // strip non numeric letters except minus and "M"
                // this is to ensure prefix has been stripped
                .replace(/[^\dM-]/g, '')

                // replace the leading minus with reserved placeholder
                .replace(/^-/, 'N')

                // strip the other minus sign (if present)
                .replace(/-/g, '')

                // replace the minus sign (if present)
                .replace('N', this.positiveOnly ? '' : '-')

                // replace decimal mark
                .replace('M', this.decimalMark);

            const partSign = value.slice(0, 1) === '-' ? '-' : '';
            const partSignAndPrefix = partSign;
            let partInteger = value;

            if (value.indexOf(this.decimalMark) >= 0) {
                parts = value.split(this.decimalMark);
                partInteger = parts[0];
                partDecimal = `${this.decimalMark}${parts[1].slice(0, this.decimalCount)}`;
            }

            if (partSign === '-') {
                partInteger = partInteger.slice(1);
            }

            partInteger = partInteger.replace(/(\d)(?=(\d{3})+$)/g, '$1' + this.delimiter);

            return (
                partSignAndPrefix +
                partInteger.toString() +
                (this.decimalCount > 0 ? partDecimal.toString() : '')
            );
        },

        getNextCursorPosition(prevPos, oldValue, newValue, delimiter) {
            return oldValue.length === prevPos
                ? newValue.length
                : prevPos + this.getPositionOffset(prevPos, oldValue, newValue, delimiter);
        },

        getPositionOffset(prevPos, oldValue, newValue, delimiter) {
            const oldRawValue = this.stripDelimiters(oldValue.slice(0, prevPos), delimiter);
            const newRawValue = this.stripDelimiters(newValue.slice(0, prevPos), delimiter);
            const lengthOffset = oldRawValue.length - newRawValue.length;
            return lengthOffset !== 0 ? lengthOffset / Math.abs(lengthOffset) : 0;
        },

        stripDelimiters(value, delimiter) {
            const delimiterRE = delimiter
                ? new RegExp(delimiter.replace(/([.?*+^$[\]\\(){}|-])/g, '\\$1'), 'g')
                : '';
            return value.replace(delimiterRE, '');
        },

        setCursor(el, position) {
            // eslint-disable-next-line func-style
            const setSelectionRange = function() {
                el.setSelectionRange(position, position);
            };

            if (el === document.activeElement) {
                setSelectionRange();
                // Android Fix
                setTimeout(setSelectionRange, 1);
            }
        },
    },
};
</script>

<style lang="scss" module>
    $white-color: $white;
    $grey-color: $grey-light;
    $black-color: $base-600;
    $active-color: $violet;

    .VInputThousands {
        position: relative;
        width: 100%;
        padding-top: 1.6rem;

        /* Sizes */
        &._small {
            input.native {
                font-size: 1.4rem;
                line-height: 1.4rem;
            }
        }

        &._medium {
            input.native {
                font-size: 1.6rem;
                line-height: 1.6rem;
            }
        }

        /* Colors */
        &._base {
            input.native {
                color: $black-color;
            }
        }

        &._dark {
            input.native {
                color: $white-color;
            }
        }

        /* Modificators */
        &._active {
            input.native {
                color: $active-color;
            }
        }

        &._disabled {
            opacity: .5;
            pointer-events: none;

            select.nativeSelect {
                pointer-events: none;
            }
        }
    }

    input.native {
        transition: color $default-transition;
    }

    .inner {
        position: relative;
        z-index: 2;
    }
</style>
