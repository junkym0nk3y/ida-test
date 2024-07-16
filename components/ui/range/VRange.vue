<template>
    <div :class="[$style.VRange, classList]">
        <div
            :style="inputsStyle"
            :class="$style.inputs"
        >

            <div :class="$style.inputWrapper">
                <div
                    v-if="showLabel && !single"
                    :class="$style.label"
                >
                    {{ labels[0] }}
                </div>

                <VInputThousands
                    ref="min"
                    :value="lazyValue[0]"
                    :name="single ? name?.substring(0, name.length - 3) : name[0]"
                    :color="color"
                    :size="size"
                    :style="getStylesMin"
                    :class="$style.input"
                    :positive-only="positiveOnly"
                    :length="inputsLength"
                    @input="onInput($event, 'first')"
                    @change="onInputChange($event, 'first')"
                />

                <div
                    v-if="postfix"
                    :class="$style.postfix"
                    v-html="postfix"
                >
                </div>
            </div>

            <div
                v-if="!single"
                :class="$style.inputWrapper"
            >
                <div
                    v-if="showLabel"
                    :class="$style.label"
                >
                    {{ labels[1] }}
                </div>

                <VInputThousands
                    :value="lazyValue[1]"
                    :name="name[1]"
                    :color="color"
                    :size="size"
                    :style="getStylesMax"
                    :class="$style.input"
                    :positive-only="positiveOnly"
                    :length="inputsLength"
                    @input="onInput($event, 'second')"
                    @change="onInputChange($event, 'second')"
                />

                <div
                    v-if="postfix"
                    :class="$style.postfix"
                    v-html="postfix"
                >
                </div>
            </div>
        </div>

        <VSlider
            v-if="single"
            v-model="lazyValue[0]"
            :min="specs.min"
            :max="specs.max"
            :step="step"
            @change="emitChange"
        />

        <VSlider
            v-else
            v-model="lazyValue"
            :color="color"
            :min="specs.min"
            :max="specs.max"
            :step="step"
            range
            @change="emitChange"
        />

        <div
            v-if="postfix"
            ref="placeholder"
            :class="$style.placeholder"
        >
            <span
                ref="minPlaceholder"
                v-html="`${splitThousands(placeholderVals.first)}`"
            >
            </span>

            <span
                v-if="!single"
                ref="maxPlaceholder"
                v-html="`${splitThousands(placeholderVals.second)}`"
            >
            </span>
        </div>
    </div>
</template>

<script>
// Utils
import { splitThousands } from 'assets/js/utils/numbers-utils';

/**
 * Позволяет пользователю ввести данные в рамках диапазона, например цены или площади.<br>
 * Включает в себя два компонента, VSilder и VInputThousands (для разбиения цены на тычячные).
 *
 * У нас на проектах применяется принцип "фасетного фильтра", т.е.:<br><br>
 *
 * <strong>specs</strong> - диапазон всех доступных значений.<br>
 * <strong>facets</strong> - значения, которые доступны после передачи параметров из
 * <strong>value</strong>.<br><br>
 *
 * <a href="https://habr.com/ru/post/517074/" target="_blank">
 *     Подробннее про работу фасетных фильтров
 * </a>
 * @version 1.0.5
 * @displayName VRange
 */
export default {
    name: 'VRange',

    props: {
        /**
         * Имя ключа для работы с формами или запросами
         */
        name: {
            type: [Array, String],
            required: true,
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
         * Добавочное значение после инпута, например знак валюты
         */
        postfix: {
            type: String,
            default: '',
        },

        /**
         * Включает лейблы от/до, в рейндже
         */
        showLabel: {
            type: Boolean,
            default: false,
        },

        /**
         * Для переопределения значений лейблов
         */
        labels: {
            type: Array,
            default: () => ['от', 'до'],
        },

        /**
         * Диапазон всех доступных значений
         */
        specs: {
            type: Object,
            required: true,
            default: () => ({ min: 1, max: 100 }),
        },

        /**
         * Значения, которые доступны после передачи параметров в backend,
         * если существует определённый item в specs, но отсуствует в facets,
         * то по логике компонента, он перестаёт быть активным для выбора.
         */
        facets: {
            type: Object,
            default: () => ({}),
        },

        /**
         * Позволяет задать шаг слайдера вручную
         */
        step: {
            type: Number,
            default: 1,
        },

        /**
         * Текущее минимальное значение, при инициализации
         */
        valueMin: {
            type: String,
            default: '',
        },

        /**
         * Текущее максимальное значение, при инициализации
         */
        valueMax: {
            type: String,
            default: '',
        },

        /**
         * Отключает функционал диапазона, в этом режиме не имеет смысла использовать facets
         */
        single: {
            type: Boolean,
            default: false,
        },

        /**
         * При передаче false - позволяет выбирать отрицательные суммы
         */
        positiveOnly: {
            type: Boolean,
            default: true,
        },

        /**
         * Это свойство отключает взаимодействие
         */
        disabled: Boolean,
    },

    data() {
        return {
            lazyValue: [this.valueMin ? this.valueMin : this.specs.min, this.valueMax ? this.valueMax : this.specs.max],
            oldValues: [this.valueMin ? this.valueMin : this.specs.min, this.valueMax ? this.valueMax : this.specs.max],
            placeholderWidth: { first: null, second: null },
            placeholderVals: { first: null, second: null },
            resizeObserver: null,
        };
    },

    computed: {
        classList() {
            return [
                {
                    [this.$style[`_${this.color}`]]: this.color,
                    [this.$style[`_${this.size}`]]: this.size,
                    [this.$style._disabled]: this.disabled,
                },
            ];
        },

        inputsLength() {
            return {
                maxlength: splitThousands(this.specs.max).length,
                minlength: splitThousands(this.specs.min).length,
            };
        },

        inputsStyle() {
            if (!this.postfix || this.postfix && this.placeholderWidth.first) {
                return { visibility: 'visible', opacity: 1 };
            } else {
                return { visibility: 'hidden' };
            }
        },

        getStylesMin() {
            if (!this.postfix || !this.placeholderWidth.first) {
                return;
            }
            return { width: `${this.placeholderWidth.first}px` };
        },

        getStylesMax() {
            if (this.single || !this.postfix || !this.placeholderWidth.second) {
                return;
            }

            return { width: `${this.placeholderWidth.second}px` };
        },

        isValuesChange() {
            return `${this.valueMin}|${this.valueMax}`;
        },
    },

    watch: {
        facets() {
            if (!this.single && !this.valueMin && !this.valueMax) {
                this.applyfacets();
            }
        },

        specs() {
            if (!this.valueMin && !this.valueMax) {
                this.applySpecs();
            }
        },

        lazyValue: {
            deep: true,
            handler(val) {
                if (!this.postfix) {
                    return;
                }

                if (this.single) {
                    this.placeholderVals.first = val[0];
                    return;
                }

                [this.placeholderVals.first, this.placeholderVals.second] = [...val];
            },
        },

        isValuesChange() {
            this.applyValues();
        },
    },

    created() {
        const min = this.valueMin ? this.valueMin : this.facets.min;

        if (this.single) {
            this.lazyValue = [min, ''];
            this.oldValues = [min, ''];
            return;
        }

        if (this.facets?.min && this.facets?.max) {
            const max = this.valueMax ? this.valueMax : this.facets.max;
            this.lazyValue = [min, max];
            this.oldValues = [min, max];
        }
    },

    mounted() {
        if (this.postfix) {
            this.resizeObserver = new ResizeObserver(this.getPlaceholderWidth);
            this.resizeObserver.observe(this.$refs.placeholder);

            this.$nextTick(() => {
                this.getPlaceholderWidth();
            });
        }
    },

    beforeDestroy() {
        if (this.postfix && this.resizeObserver) {
            this.resizeObserver.unobserve(this.$refs.placeholder);
            this.resizeObserver = null;
            this.placeholderWidth = { first: null, second: null };
        }
    },

    methods: {
        /**
         * Импорт из библиотеки функций, разбивает число на тысячные
         * @param {String} val Число для разбиения
         * @returns {String} Результат работы функции
         * @public
         */
        splitThousands,

        /**
         * Обновляет значение lazyValues компонента, при изменении передаваемых пропсов
         * @public
         */
        applyValues() {
            const min = this.valueMin ? this.valueMin : this.facets.min;
            const max = this.valueMax ? this.valueMax : this.facets.max;
            this.lazyValue = ['', ''];
            this.$nextTick(() => {
                this.lazyValue = [min, max];
                this.oldValues = [min, max];
            });
        },

        /**
         * Для корректной работы ResizeObserver, позволяет задать
         * размер плейсхолдера, для корректной работы postfix
         * @public
         */
        getPlaceholderWidth() {
            this.placeholderWidth.first = this.$refs.minPlaceholder?.offsetWidth;

            if (!this.single) {
                this.placeholderWidth.second = this.$refs.maxPlaceholder?.offsetWidth;
            }
        },

        /**
         * Вызывается из watch facets, чтобы изменить значение рейнджей и инпута,
         * после выполнения запроса в backend.
         * Только в случае, если не заданы valueMin и valueMax
         * @public
         */
        applyfacets() {
            if (this.facets.min && this.facets.max && (!this.valueMin && !this.valueMax)) {
                this.lazyValue = ['', ''];
                this.$nextTick(() => {
                    this.lazyValue = [this.facets.min, this.facets.max];
                    this.oldValues = [this.facets.min, this.facets.max];
                });
            } else {
                console.warn('Something wrong with range facets');
            }
        },

        /**
         * Вызывается из watch specks, чтобы изменить значение рейнджей и инпута,
         * после выполнения запроса в backend.
         * Только в случае, если не заданы valueMin и valueMax
         * @public
         */
        applySpecs() {
            this.lazyValue = [this.specs.min, this.specs.max];
            this.oldValues = [this.specs.min, this.specs.max];
        },

        /**
         * Вызывается после ручного введения данных, через инпут.
         * Позволяет задать размер плейсхолдера, для корректной работы postfix
         * @param {Number} val Значение
         * @param {String} handler Ключ объекта placeholderVals
         * @public
         */
        onInput(val, handler) {
            if (this.placeholderVals[handler] !== val) {
                this.placeholderVals[handler] = val;
            }
        },

        /**
         * Вызывается после ручного введения данных, через инпут.
         * Сохраняет новые значения в lazyValue.
         * Необходимо для решения проблем реактивности.
         * @param {Number} val Значение
         * @param {String} handler Для определения min или max изменений
         * @public
         */
        onInputChange(val, handler) {
            const isDifferentVal = val !== this.lazyValue[handler === 'first' ? 0 : 1];
            const isGreaterVal = val > this.lazyValue[1];
            const isSmallerVal = val < this.lazyValue[0];

            if (this.single && handler === 'first' && isDifferentVal) {
                this.lazyValue[0] = val;
            } else if (handler === 'first' && isDifferentVal) {
                this.lazyValue = isGreaterVal ? [this.lazyValue[1], val] : [val, this.lazyValue[1]];
            } else if (handler === 'second' && isDifferentVal) {
                this.lazyValue = isSmallerVal ? [val, this.lazyValue[0]] : [this.lazyValue[0], val];
            } else {
                this.placeholderVals[handler] = val;
            }

            if (isDifferentVal) {
                this.$nextTick(() => {
                    this.emitChange();
                });
            }
        },

        /**
         * Эмитит новые значения в родительский компонент,
         * для передачи в запрос фильтра
         * @returns {Object} values Объект с ключами из name
         * @public
         */
        emitChange() {
            let [minValue, maxValue] = this.lazyValue;

            if (minValue <= this.facets.min) {
                minValue = this.facets.min;
            }

            if (!this.single) {
                if (maxValue >= this.facets.max) {
                    maxValue = this.facets.max;
                }
            }

            let name = [];

            if (this.single) {
                name = this.name;
            } else if (Array.isArray(this.name)) {
                name = [...this.name];
            } else {
                name = [`${this.name}Min`, `${this.name}Max`];
            }

            if (this.lazyValue !== [minValue, maxValue]) {
                this.lazyValue = [minValue, maxValue];
            }

            if (JSON.stringify(this.lazyValue) !== JSON.stringify(this.oldValues)) {
                this.oldValues = [minValue, maxValue];

                let emitData = '';

                if (this.single) {
                    emitData = {
                        [name]: minValue === null ? '0' : minValue.toString(),
                    };
                } else {
                    emitData = {
                        [name[0]]: minValue === null ? '0' : minValue.toString(),
                        [name[1]]: maxValue === null ? '0' : maxValue.toString(),
                    };
                }

                /**
                 * Отдаёт выбранные пользователем значения
                 * @event change
                 * @param {Object} emitData Объект с ключами из name
                 */
                this.$emit('change', emitData);
            }
        },
    },
};
</script>

<style lang="scss" module>
    $grey-light-color: $grey-middle;
    $grey-color: $grey;

    .VRange {
        display: flex;
        flex-direction: column;
        font-size: 1.6rem;

        /* Sizes */
        &._small {
            .label {
                margin-right: .2rem;
            }

            .inputWrapper {
                font-size: 1.4rem;
                line-height: 1;
            }

            .postfix {
                margin-left: .2rem;
            }

            .inputs {
                padding-bottom: 1rem;
            }
        }

        &._medium {
            .inputWrapper {
                font-size: 1.6rem;
                line-height: 1;
            }

            .label {
                margin-right: .4rem;
            }

            .postfix {
                margin-left: .4rem;
            }

            .inputs {
                padding-bottom: .8rem;
            }
        }

        /* Colors */
        &._base {
            .postfix,
            .label {
                color: $grey-color;
            }
        }

        &._dark {
            .postfix,
            .label {
                color: $grey-light-color;
            }
        }

        /* Modificators */
        &._disabled {
            opacity: .5;
            pointer-events: none;

            select.nativeSelect {
                pointer-events: none;
            }
        }

        .input {
            &:global(.v-input) {
                width: 50%;
                padding-top: 0;
                font-size: inherit;
            }

            :global(.v-input__native) {
                width: 100%;
                padding-bottom: 0;
            }
        }
    }

    .inputs {
        visibility: hidden;
        display: flex;
        justify-content: space-between;
        line-height: 1;
        opacity: 0;
        transition: opacity .2s ease;
    }

    .inputWrapper {
        display: inline-flex;
        align-items: center;
        width: auto;

        &:last-child {
            justify-content: right;
        }
    }

    .postfix,
    .label {
        cursor: default;
        user-select: none;
    }

    .placeholder {
        position: absolute;
        z-index: -1;
        visibility: hidden;
        font-size: inherit;
        letter-spacing: initial;
        cursor: default;
    }
</style>
