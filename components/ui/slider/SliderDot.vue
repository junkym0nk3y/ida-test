<template>
    <div
        :class="[$style.SliderDot, classList]"
        :style="styles"
        tabindex="0"
        @focus="onMouseEnter"
        @blur="onMouseLeave"
        @mouseenter="onMouseEnter"
        @mouseleave="onMouseLeave"
        @mousedown.prevent="onMouseDown"
        @touchstart.prevent="onMouseDown"
        @keydown.left="onLeftKeyDown"
        @keydown.right="onRightKeyDown"
        @keydown.down.prevent="onLeftKeyDown"
        @keydown.up.prevent="onRightKeyDown"
    >

        <div
            v-if="showTooltip"
            :class="$style.tooltip"
        >
            {{ formatValue }}
        </div>

        <div :class="['handle', $style.handle]"></div>
    </div>
</template>

<script>
export default {
    name: 'SliderDot',

    props: {
        value: {
            type: Number,
            default: 0,
        },

        vertical: Boolean,

        dragging: {
            type: Boolean,
            default: false,
        },

        focus: {
            type: Boolean,
            default: false,
        },
    },

    data() {
        return {
            hovering: false,
            isClick: false,
            startX: 0,
            currentX: 0,
            startY: 0,
            currentY: 0,
            startPosition: 0,
        };
    },

    computed: {
        classList() {
            return [{
                [this.$style._hover]: this.hovering,
                [this.$style._dragging]: this.dragging,
            }];
        },

        disabled() {
            return this.$parent.$disabled;
        },

        max() {
            return this.$parent.max;
        },

        min() {
            return this.$parent.min;
        },

        step() {
            return this.$parent.step;
        },

        tooltip() {
            return this.$parent.tooltip;
        },

        precision() {
            return this.$parent.precision;
        },

        enableFormat() {
            return this.$parent.tooltipFormat instanceof Function;
        },

        formatValue() {
            return this.enableFormat && this.$parent.tooltipFormat(this.value) || this.value;
        },

        currentPosition() {
            return `${(this.value - this.min) / (this.max - this.min) * 100}%`;
        },

        styles() {
            if (this.vertical) {
                return {
                    bottom: this.currentPosition,
                    transition: this.dragging ? 'bottom 0s ease' : 'bottom .5s ease',
                };
            } else {
                return {
                    left: this.currentPosition,
                    transition: this.dragging ? 'left 0s ease' : 'left .5s ease',
                };
            }
        },

        showTooltip() {
            switch (this.tooltip) {
                case 'always':
                    return true;
                case 'never':
                    return false;
                case 'focus':
                    return this.focus || this.hovering;
                default:
                    return false;
            }
        },
    },

    methods: {
        onMouseEnter() {
            this.hovering = true;
        },

        onMouseLeave() {
            this.hovering = false;
        },

        onLeftKeyDown() {
            if (!this.disabled) {
                this.setPosition(parseFloat(this.currentPosition) - this.step / (this.max - this.min) * 100);
                this.$parent.emitChange();
            }
        },

        onRightKeyDown() {
            if (!this.disabled) {
                this.setPosition(parseFloat(this.currentPosition) + this.step / (this.max - this.min) * 100);
                this.$parent.emitChange();
            }
        },

        onMouseDown(e) {
            if (!this.disabled) {
                this.onDragStart(e);
                this.bindEvents();
            }
        },

        onDragStart(event) {
            this.$emit('dragstart');

            this.isClick = true;
            if (event.type === 'touchstart') {
                event.clientY = event.touches[0].clientY;
                event.clientX = event.touches[0].clientX;
            }
            if (this.vertical) {
                this.startY = event.clientY;
            } else {
                this.startX = event.clientX;
            }
            this.startPosition = parseFloat(this.currentPosition);
        },

        onDragging(event) {
            if (this.dragging) {
                this.isClick = false;
                let diff = 0;
                if (event.type === 'touchmove') {
                    event.clientY = event.touches[0].clientY;
                    event.clientX = event.touches[0].clientX;
                }
                if (this.vertical) {
                    this.currentY = event.clientY;
                    diff = (this.startY - this.currentY) / this.$parent.sliderSize * 100;
                } else {
                    this.currentX = event.clientX;
                    diff = (this.currentX - this.startX) / this.$parent.sliderSize * 100;
                }
                this.setPosition(this.startPosition + diff);
            }
        },

        onDragEnd() {
            if (this.dragging) {
                setTimeout(() => {
                    this.$emit('dragend');
                    if (!this.isClick) {
                        this.$parent.emitChange();
                    } else {
                        this.isClick = false;
                    }
                }, 0);
                this.unbindEvents();
            }
        },

        setPosition(percent) {
            if (percent === null || isNaN(percent)) {
                return;
            }
            if (percent < 0) {
                percent = 0;
            }
            if (percent > 100) {
                percent = 100;
            }

            const lengthPerStep = 100 / ((this.max - this.min) / this.step);
            const steps = Math.round(percent / lengthPerStep);
            let value = steps * lengthPerStep * (this.max - this.min) * 0.01 + this.min;
            value = parseFloat(value.toFixed(this.precision));

            this.$emit('input', value);
        },

        bindEvents() {
            window.addEventListener('mousemove', this.onDragging);
            window.addEventListener('touchmove', this.onDragging);
            window.addEventListener('mouseup', this.onDragEnd);
            window.addEventListener('touchend', this.onDragEnd);
            window.addEventListener('contextmenu', this.onDragEnd);
        },

        unbindEvents() {
            window.removeEventListener('mousemove', this.onDragging);
            window.removeEventListener('touchmove', this.onDragging);
            window.removeEventListener('mouseup', this.onDragEnd);
            window.removeEventListener('touchend', this.onDragEnd);
            window.removeEventListener('contextmenu', this.onDragEnd);
        },
    },
};
</script>

<style lang="scss" module>
    .SliderDot {
        position: absolute;
        top: 50%;
        z-index: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 1.6rem;
        height: 1.6rem;
        text-align: center;
        line-height: normal;
        transform: translate(-50%, -50%);
        user-select: none;

        .handle {
            width: 1.6rem;
            height: 1.6rem;
            border-radius: 50%;
            transition: all $default-transition 0s;
            user-select: none;

            &:hover {
                transform: scale(1.1);
            }
        }

        .tooltip {
            position: absolute;
            bottom: 100%;
            left: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            min-width: 36px;
            padding: 4px;
            font-size: 12px;
            transform: translateX(-50%);
            pointer-events: none;

            &:before {
                content: "";
                position: absolute;
                top: 100%;
                left: 50%;
                width: 6px;
                height: 6px;
                transform: translate(-50%, -50%) rotate(45deg);
            }
        }
    }
</style>
