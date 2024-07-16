<template>
    <div
        v-clickoutside="onClickOutside"
        :class="[$style.VSelect, classList]"
    >

        <div
            :class="$style.field"
            @click.stop="handleToggleMenu"
        >
            <input
                ref="input"
                :class="$style.nativeInput"
                type="text"
                :value="selectedLabel"
                :disabled="isDisabled"
                :readonly="true"
                :name="name"
                :data-test-id="name"
                @focus="onFocus"
                @keydown.down.stop.prevent="handleNavigateOptions('down')"
                @keydown.up.stop.prevent="handleNavigateOptions('up')"
                @keydown.enter.prevent="onEnterPress"
                @keydown.esc="isOpened = false"
                @keydown.tab="onBlur"
                @mouseenter="inputHovering = true"
                @mouseleave="inputHovering = false"
            />

            <svg-icon
                :class="$style.arrow"
                name="drop"
            />
        </div>

        <transition name="dropdown">
            <div
                v-if="isOpened"
                :class="$style.dropdown"
            >
                <VScrollBox
                    :class="$style.scrollbox"
                    resizable
                    @close="onClickOutside"
                >
                    <DropdownOption
                        v-for="(option, index) in optionList"
                        :key="`${index}_${option[valueName]}`"
                        :option="option"
                        :value="value"
                        :value-name="valueName"
                        :label-name="labelName"
                        :size="size"
                        :color="color"
                        :is-highlighted="highlightIndex === index"
                        @mouseenter="highlightIndex = index"
                        @mouseleave="highlightIndex = -1 "
                        @click="onOptionSelect"
                    />
                </VScrollBox>
            </div>
        </transition>

        <select
            v-show="!isDisabled"
            :name="name"
            v-bind="nativeSelectorAttrs"
            :class="$style.nativeSelect"
            @change="onNativeChange"
        >
            <option
                v-for="(option, index) in optionList"
                :key="`${index}_mobile_${option[valueName]}`"
                :value="option[valueName]"
                v-bind="handleOptionAttrs(option)"
            >
                {{ option[labelName] }}
            </option>
        </select>
    </div>
</template>

<script>
/**
 * При работе с фильтрами и формами - позволяет выбирать одно или несколько значений.<br><br>
 *
 * У нас на проектах применяется принцип "фасетного фильтра", т.е.:<br>
 *
 * <strong>specs</strong> - диапазон всех доступных значений.<br>
 * <strong>facets</strong> - значения, которые доступны после передачи параметров из
 * <strong>value</strong>.<br><br>
 *
 * <a href="https://habr.com/ru/post/517074/" target="_blank">
 *     Подробннее про работу фасетных фильтров
 * </a>
 *
 * @version 1.0.4
 * @displayName VSelect
 */
export default {
    name: 'VSelect',

    props: {
        /**
         * Имя поля (phone, email, name и т.д.) нужно для тестов
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

        /**
         * Текущее значение для определения активного элемента
         */
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
         * Диапазон всех доступных значений селектора
         */
        specs: {
            type: Array,
            required: true,
        },

        /**
         * Значения, которые доступны после передачи параметров в backend,
         * если существует определённый item в specs, но отсуствует в facets,
         * то по логике компонента, он перестаёт быть активным для выбора.
         */
        facets: {
            type: Array,
            required: true,
        },

        /**
         * Значение, которое подставляется в селектор, визуально,
         * если в value является пустой переменной.
         */
        placeholder: {
            type: String,
            default: 'Все',
        },

        /**
         * Доп. элемент в селекторе, при выборе
         * которого - сбрасывается состояние value
         */
        resetLabel: {
            type: String,
            default: 'Все',
        },

        /**
         * Включает возможноть выбора более одного элемента.
         */
        multiple: {
            type: Boolean,
            default: false,
        },

        /**
         * Скрывает выбранные варианты из селектора
         */
        hideSelected: Boolean,

        /**
         * Модификатор вида селектора с бордером
         */
        border: {
            type: Boolean,
            default: true,
        },

        /**
         * Это свойство отключает взаимодействие
         */
        disabled: Boolean,

        /**
         * Запрещает сброс активного элемента
         */
        required: Boolean,
    },

    data() {
        return {
            isFocused: false,
            isOpened: false,
            highlightIndex: -1,
            inputHovering: false,
        };
    },

    computed: {
        nativeSelectorAttrs() {
            const options = {};
            if (this.required) {
                options.required = true;
            }

            if (this.multiple) {
                options.multiple = 'multiple';
            }

            return options;
        },

        classList() {
            return [
                {
                    [this.$style[`_${this.color}`]]: this.color,
                    [this.$style[`_${this.size}`]]: this.size,
                    [this.$style._border]: this.border,
                    [this.$style._selected]: this.selectedOption,
                    [this.$style._focused]: this.isFocused,
                    [this.$style._opened]: this.isOpened,
                    [this.$style._disabled]: this.isDisabled,
                },
            ];
        },

        optionList() {
            const specs = [];

            this.specs.forEach((opt, index) => {
                if (opt[this.valueName] === this.value && this.hideSelected) {
                    return;
                }

                specs.push({
                    ...opt,
                    disabled: this.facets && !this.facets.includes(opt[this.valueName]) && opt[this.valueName] !== '',
                    selected: this.handleActiveNative(opt[this.valueName]) ? index + 1 : false,
                });
            });

            if (!this.required && this.resetLabel) {
                specs.unshift({
                    [this.labelName]: this.resetLabel,
                    [this.valueName]: '',
                    disabled: !(!this.multiple || this.multiple && Array.isArray(this.value) && this.value.length),
                });
            }

            return specs;
        },

        selectedOption() {
            if (this.multiple) {
                if (this.value) {
                    if (Array.isArray(this.value)) {
                        return this.specs.filter(a => this.value.includes(a[this.valueName]));
                    } else {
                        const selected = this.specs.filter(a => a[this.valueName] === this.value)[0];
                        if (!selected) {
                            console.warn('Error occured while selected computed');
                        }
                        return selected;
                    }
                } else {
                    return null;
                }
            } else {
                return this.specs.filter(a => a[this.valueName] === this.value)[0] || null;
            }
        },

        selectedLabel() {
            if (this.multiple) {
                if (this.value !== '') {
                    if (Array.isArray(this.value)) {
                        return this.selectedOption
                            .reduce((acc, cur) => `${acc + cur?.[this.labelName]}, `, '')
                            .slice(0, -2);
                    } else {
                        return this.selectedOption?.[this.labelName];
                    }
                }
                if (!this.required && (this.resetLabel && this.value)) {
                    return this.resetLabel;
                } else {
                    return this.placeholder;
                }
            } else {
                return this.selectedOption
                    ? this.selectedOption?.[this.labelName]
                    : this.placeholder;
            }
        },

        isDisabled() {
            return this.disabled || this.specs.length === 0;
        },
    },

    methods: {
        /**
         * Отрабатывает во время выбора доступного элемента,
         * обрабатывает данные и отдаёт выбранный элемент родителю
         * @param {Object} option Объект селектора
         * @public
         */
        onOptionSelect(option) {
            let newValue;

            if (this.multiple) {
                if (!option[this.valueName]) {
                    newValue = '';
                } else if (Array.isArray(this.value)) {
                    newValue = this.value.slice();

                    if (newValue.includes(option[this.valueName])) {
                        newValue.splice(this.value.indexOf(option[this.valueName]), 1);
                        if (newValue.length === 1) {
                            newValue = newValue[0];
                        }
                    } else {
                        newValue.push(option[this.valueName]);
                    }
                } else {
                    newValue = this.value;
                    if (newValue === option[this.valueName]) {
                        newValue = '';
                    } else {
                        newValue = newValue.length ? [newValue, option[this.valueName]] : option[this.valueName] ? [option[this.valueName]] : '';
                    }
                }
            } else {
                newValue = this.value !== option[this.valueName] || this.required ? option[this.valueName] : '';
            }

            if (!this.multiple || newValue === '') {
                this.onBlur();
            }

            if (this.name) {
                newValue = { [this.name]: newValue };
            }

            /**
             * Отдаёт выбранный вариант родителю
             * @event change
             * @param {Object|Array} option Объект или массив селектора
             */
            this.$emit('change', newValue);

            this.onFocus();
        },

        /**
         * Метод, аналогичный onOptionSelect методу, но для работы
         * нативного селектора, который отображается на мобильных устройствах
         * @public
         */
        onNativeChange(option) {
            let newValue = '';

            if (this.multiple) {
                let value = [];
                for (let i = 0; i < option.target.options.length; i++) {
                    const opt = option.target.options[i];

                    if (opt.selected && !opt.disabled) {
                        value.push(opt.value);
                    }

                    if (opt.disabled) {
                        opt.selected = false;
                    }
                }

                if (value.length && value.includes('')) {
                    value = '';

                    for (let i = 0; i < option.target.options.length; i++) {
                        const opt = option.target.options[i];
                        opt.selected = false;
                    }
                }

                newValue = this.name ? { [this.name]: value.length ? value : '' } : value.length ? value : '';
            } else {
                newValue = this.name ? { [this.name]: option.target.value } : option.target.value;
            }

            /**
             * Отдаёт выбранный вариант родителю
             * @event change
             * @param {Object|Array} option Объект или массив селектора
             */
            this.$emit('change', newValue);
        },

        /**
         * Метод, который обрабатывает событие focus на инпуте
         * @public
         */
        onFocus() {
            this.isFocused = true;
            this.$refs.input.focus();

            /**
             * Передаёт родителю, что компонент находится в focus.
             * В большинстве реализаций - может и не пригодится
             * @event focus
             */
            this.$emit('focus');
        },

        /**
         * Метод, который обрабатывает событие blur на инпуте
         * @public
         */
        onBlur() {
            if (this.isOpened) {
                this.isOpened = false;
            }
            this.isFocused = false;
            this.$refs.input.blur();

            /**
             * Передаёт родителю, что компонент больше не находится в focus.
             * В большинстве реализаций - может и не пригодится
             * @event blur
             */
            this.$emit('blur');
        },

        /**
         * Вызывается в тот момент, когда пользовать
         * сделал клик за пределы вызываемого селектором окна
         * @public
         */
        onClickOutside() {
            this.onBlur();

            /**
             * Эмитит в тот момент, когда пользовать
             * сделал клик за пределы вызываемого селектором окна
             * @event click-outside
             */
            this.$emit('click-outside');
        },

        /**
         * Перехватывает событие, при нажатии клавиши enter,
         * Открывает закрытый селектор или выбирает текущий item
         * @public
         */
        onEnterPress() {
            if (!this.isOpened) {
                this.handleToggleMenu();
            } else if (this.optionList[this.highlightIndex]) {
                this.onOptionSelect(this.optionList[this.highlightIndex]);
            }
        },

        /**
         * Открывает или закрывает попап меню выбора
         * @public
         */
        handleToggleMenu() {
            if (this.isDisabled) {
                return;
            }

            this.isOpened = !this.isOpened;

            if (this.isOpened) {
                this.$refs.input.focus();
            }
        },

        /**
         * Для навигации с помощью клавиш up/down,
         * перехватывая нажатия этих клавиш
         * @param {String} direction Направление
         * @public
         */
        handleNavigateOptions(direction) {
            if (!this.isOpened) {
                this.isOpened = true;
                return;
            }

            if (direction === 'down') {
                this.highlightIndex++;
                if (this.highlightIndex === this.optionList.length) {
                    this.highlightIndex = 0;
                }
            } else if (direction === 'up') {
                this.highlightIndex--;
                if (this.highlightIndex < 0) {
                    this.highlightIndex = this.optionList.length - 1;
                }
            }

            const option = this.optionList[this.highlightIndex];

            if (option.disabled) {
                this.handleNavigateOptions(direction);
            }
        },

        /**
         * Вспомогательный метод для работы с мобильным устройствами.
         * В computed optionList возвращает индекс элемента для аттрибута selected
         * @param {String} value Option value
         * @returns {Boolean} selected Is value selected
         * @public
         */
        handleActiveNative(value) {
            if (this.multiple) {
                return this.value.includes(value);
            } else {
                return value === this.value;
            }
        },

        /**
         * Вспомогательный метод для работы с мобильным устройствами.
         * Возвращает нужные аттрибуты в нативные option
         * @param {Object} opt Option
         * @returns {Object} v-bind Attrs
         * @public
         */
        handleOptionAttrs(opt) {
            const attrs = {};

            if (opt.selected) {
                attrs.selected = opt.selected;
            }

            if (opt.disabled) {
                attrs.disabled = 'disabled';
            }

            return attrs;
        },
    },
};
</script>

<style lang="scss" module>
    $white-color: $white;
    $grey-color: $grey-light;
    $black-color: $base-600;
    $active-color: $violet;

    .VSelect {
        position: relative;
        user-select: none;

        /* Sizes */
        &._small {
            select.nativeSelect,
            input.nativeInput {
                font-size: 1.4rem;
                line-height: 1.4rem;
            }

            input.nativeInput {
                padding-right: 2.4rem;
            }

            &._border {
                input.nativeInput {
                    padding-bottom: 1rem;
                }
            }

            .arrow {
                top: .4rem;
                width: 1rem;
                height: 1rem;
            }
        }

        &._medium {
            select.nativeSelect,
            input.nativeInput {
                font-size: 1.6rem;
                line-height: 1.6rem;
            }

            input.nativeInput {
                padding-right: 2.4rem;
            }

            &._border {
                input.nativeInput {
                    padding-bottom: 1.8rem;
                }
            }

            .arrow {
                top: .4rem;
                width: 1.2rem;
                height: 1.2rem;
            }
        }

        /* Colors */
        &._base {
            input.nativeInput,
            .arrow {
                &:hover {
                    opacity: .7;
                }
            }

            .dropdown {
                background: $white-color;
                color: $black-color;
            }

            &:after {
                background-color: $grey-color;
            }
        }

        &._dark {
            input.nativeInput,
            .arrow {
                color: $white-color;

                &:hover {
                    opacity: .7;
                }
            }

            .dropdown {
                background: $black-color;
                color: $white-color;
            }

            &:after {
                background-color: $grey-color;
            }
        }

        /* Modificators */
        &._border {
            &:after {
                content: "";
                position: absolute;
                bottom: -.2rem;
                left: 0;
                width: 100%;
                height: .2rem;
                border-radius: .6rem;
                background-color: $grey-color;
            }
        }

        &._selected {
            &:after {
                background-color: $active-color;
            }
        }

        &._focused {
            input.nativeInput {
                border-color: $active-color;
            }
        }

        &._opened {
            .arrow {
                transform: rotate(180deg);
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

    .field {
        position: relative;
        width: 100%;
    }

    .arrow {
        position: absolute;
        right: 0;
        height: 100%;
        transition: all .3s;
        cursor: pointer;

        svg {
            width: 100%;
            height: 100%;
        }

        &:hover {
            opacity: .7;
        }
    }

    .dropdown {
        position: absolute;
        top: calc(100% - .4rem);
        left: 0;
        z-index: 10;
        display: block;
        width: 100%;
        padding: 1.2rem 0;
        border-radius: .4rem;
        transform: translate3d(0, 0, 0);
        transition: opacity .2s ease, transform .2s ease;
        box-shadow: 8px 8px 30px rgb(0 0 0 / 12%);

        .scrollbox {
            max-height: 18rem;
        }

        @include respond-to(tablet) {
            z-index: -1;
            display: none;
            pointer-events: auto;
        }
    }

    input.nativeInput {
        overflow: hidden;
        display: inline-block;
        width: 100%;
        text-overflow: ellipsis;
        white-space: nowrap;
        font-weight: 500;
        transition: color $default-transition, opacity $default-transition, background $default-transition;
        cursor: pointer;

        &::selection {
            background: transparent;
        }

        &:hover {
            opacity: .7;
        }
    }

    select.nativeSelect {
        position: absolute;
        top: 0;
        left: 0;
        z-index: -1;
        width: 100%;
        height: 100%;
        opacity: 0;
        pointer-events: none;

        @include respond-to(tablet-sm) {
            z-index: 2;
            display: block;
            pointer-events: auto;
        }
    }
</style>
