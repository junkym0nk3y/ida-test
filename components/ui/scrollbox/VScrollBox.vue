<template>
    <div
        ref="box"
        :class="['c-scrollbox', $style.VScrollBox]"
    >
        <div
            ref="placeholder"
            :class="$style.placeholder"
        >
        </div>

        <div
            :class="[$style.fadeMask, classListMask]"
        >
            <div
                ref="wrapper"
                data-scroll-lock-scrollable
                :class="['scrollbox-wrapper', $style.wrapper, {[$style._offset]: isYOverflowing && !skipOffset}]"
                @scroll="onScroll"
            >
                <div
                    ref="content"
                    :class="$style.content"
                >
                    <slot></slot>
                </div>
            </div>
        </div>

        <div
            v-if="isYOverflowing"
            ref="yRail"
            :class="[$style.scrollbar, $style._vertical]"
            @mousedown="onRailClick($event, 'y')"
        >
            <div
                ref="yThumb"
                :class="$style.thumb"
                :style="{height: `${dimensions.yThumbHeight}px`, transform: yScrollPosition}"
                @mousedown="onThumbClick($event, 'y')"
            >
            </div>
        </div>

        <div
            v-if="isXOverflowing"
            ref="xRail"
            :class="[$style.scrollbar, $style.horizontal]"
            @mousedown="onRailClick($event, 'x')"
        >
            <div
                ref="xThumb"
                :class="$style.thumb"
                :style="{width: `${dimensions.xThumbWidth}px`, transform: xScrollPosition}"
                @mousedown="onThumbClick($event, 'x')"
            >
            </div>
        </div>
    </div>
</template>

<script>
import { getFontSize } from '~/assets/js/utils/ui-utils';

export default {
    name: 'VScrollBox',

    props: {
        resizable: Boolean,
        skipOffset: Boolean,
        fade: Boolean,
    },

    data() {
        return {
            axis: {
                x: {
                    clientAttr: 'clientX',
                    offsetAttr: 'left',
                    offsetSizeAttr: 'offsetWidth',
                    scrollSizeAttr: 'scrollWidth',
                    scrollOffsetAttr: 'scrollLeft',
                    scrollbarSize: 0,
                    scrollLeft: 0,
                    click: 0,
                },

                y: {
                    clientAttr: 'clientY',
                    offsetAttr: 'top',
                    offsetSizeAttr: 'offsetHeight',
                    scrollSizeAttr: 'scrollHeight',
                    scrollOffsetAttr: 'scrollTop',
                    scrollbarSize: 0,
                    scrollTop: 0,
                    click: 0,
                },
            },

            dimensions: {
                boxHeight: 0,
                boxWidth: 0,
                contentHeight: 0,
                contentWidth: 0,
                yRailHeight: 0,
                yThumbHeight: 0,
                xRailWidth: 0,
                xThumbWidth: 0,
            },

            scrollXTicking: false,
            scrollYTicking: false,

            isYOverflowing: false,
            isXOverflowing: false,

            draggingAxis: null,
            resizeObserverContent: null,
        };
    },

    computed: {
        classListMask() {
            return [{
                _top: this.axis.y.scrollTop / (this.dimensions.contentHeight - this.dimensions.boxHeight) <= .02,
                _bottom: this.axis.y.scrollTop / (this.dimensions.contentHeight - this.dimensions.boxHeight) >= .98,
                _show: this.fade && this.isYOverflowing,
            }];
        },

        yScrollPosition() {
            if (!this.isYOverflowing) {
                return 0;
            }

            const scrollPercentage =
                this.axis.y.scrollTop / (this.dimensions.contentHeight - this.dimensions.boxHeight);

            const handleOffset = ~~(
                (this.dimensions.yRailHeight - this.dimensions.yThumbHeight) *
                scrollPercentage
            );

            return `translate3d(0, ${handleOffset}px, 0)`;
        },

        xScrollPosition() {
            if (!this.isXOverflowing) {
                return 0;
            }

            const scrollPercentage =
                this.axis.x.scrollLeft / (this.dimensions.contentWidth - this.dimensions.boxWidth);

            const handleOffset = ~~(
                (this.dimensions.xRailWidth - this.dimensions.xThumbWidth) *
                scrollPercentage
            );

            return `translate3d(${handleOffset}px, 0, 0)`;
        },
    },

    mounted() {
        if (this.resizable) {
            this.resizeObserverContent = new ResizeObserver(this.onUpdate);
            this.resizeObserverContent.observe(this.$refs.content);
        } else {
            this.$nextTick(() => {
                this.onUpdate();
            });
        }
    },

    beforeDestroy() {
        if (this.resizable && this.resizeObserverContent) {
            this.resizeObserverContent.unobserve(this.$refs.content);
            this.resizeObserverContent = null;
        }
    },

    methods: {
        onUpdate() {
            const contentHeight = this.$refs.content.scrollHeight;
            const contentWidth = this.$refs.content.scrollWidth;

            // Determine placeholder size
            if (this.resizable) {
                const surplus = 5.6 * getFontSize();
                this.$refs.placeholder.style.width = `${Math.round(contentWidth + surplus)}px`;
            }

            this.$refs.placeholder.style.height = `${contentHeight}px`;

            const boxWidth = this.$refs.box.offsetWidth;
            const boxHeight = this.$refs.box.offsetHeight;

            this.isXOverflowing = contentWidth > boxWidth;
            this.isYOverflowing = contentHeight > boxHeight;

            this.$nextTick(() => {
                this.dimensions.boxHeight = boxHeight;
                this.dimensions.boxWidth = boxWidth;
                this.dimensions.contentHeight = contentHeight;
                this.dimensions.contentWidth = contentWidth;

                if (boxHeight >= contentHeight) {
                    this.$emit('scroll-end', true);
                } else {
                    this.$emit('scroll-end', false);
                }

                if (this.isYOverflowing) {
                    this.dimensions.yRailHeight = this.$refs.yRail.offsetHeight;
                    this.dimensions.yThumbHeight = this.handleGetScrollbarSize('y');
                }

                if (this.isXOverflowing) {
                    this.dimensions.xRailWidth = this.$refs.xRail.offsetWidth;
                    this.dimensions.xThumbWidth = this.handleGetScrollbarSize('x');
                }
            });
        },

        onScroll() {
            if (!this.scrollXTicking && this.isXOverflowing) {
                requestAnimationFrame(() => {
                    this.axis.x.scrollLeft = this.$refs.wrapper.scrollLeft;
                    this.scrollXTicking = false;
                });
                this.scrollXTicking = true;
            }

            if (!this.scrollYTicking && this.isYOverflowing) {
                requestAnimationFrame(() => {
                    this.axis.y.scrollTop = this.$refs.wrapper.scrollTop;
                    this.scrollYTicking = false;
                });
                this.scrollYTicking = true;
            }
            this.$emit('on-scroll');
        },

        onThumbClick(e, axis = 'y') {
            if (e.ctrlKey || e.button === 2) {
                return;
            }
            e.stopImmediatePropagation();

            this.axis[axis].click =
                e.currentTarget[this.axis[axis].offsetSizeAttr] -
                (e[this.axis[axis].clientAttr] -
                    e.currentTarget.getBoundingClientRect()[this.axis[axis].offsetAttr]);
            this.draggingAxis = axis;
            document.addEventListener('mousemove', this.onMouseMove);
            document.addEventListener('mouseup', this.onMouseUp);
            document.onselectstart = () => false;
        },

        onMouseMove(e) {
            const prevPage = this.axis[this.draggingAxis].click;
            if (!prevPage) {
                return;
            }

            const rail = this.draggingAxis === 'y' ? this.$refs.yRail : this.$refs.xRail;
            const thumb = this.draggingAxis === 'y' ? this.$refs.yThumb : this.$refs.xThumb;

            const offset =
                (rail.getBoundingClientRect()[this.axis[this.draggingAxis].offsetAttr] -
                    e[this.axis[this.draggingAxis].clientAttr]) *
                -1;
            const thumbClickPosition =
                thumb[this.axis[this.draggingAxis].offsetSizeAttr] - prevPage;
            const thumbPositionPercentage =
                (offset - thumbClickPosition) * 100 /
                rail[this.axis[this.draggingAxis].offsetSizeAttr];

            this.$refs.wrapper[this.axis[this.draggingAxis].scrollOffsetAttr] =
                thumbPositionPercentage *
                this.$refs.wrapper[this.axis[this.draggingAxis].scrollSizeAttr] /
                100;
        },

        onMouseUp(e) {
            e.preventDefault();
            this.axis[this.draggingAxis].click = 0;
            this.draggingAxis = null;
            document.removeEventListener('mousemove', this.onMouseMove);
            document.removeEventListener('mouseup', this.onMouseUp);
            document.onselectstart = null;
        },

        onRailClick(e, axis = 'y') {
            const offset = Math.abs(e.target.getBoundingClientRect()[this.axis[axis].offsetAttr] -
                e[this.axis[axis].clientAttr]);

            const rail = axis === 'y' ? this.$refs.yRail : this.$refs.xRail;
            const thumb = axis === 'y' ? this.$refs.yThumb : this.$refs.xThumb;
            const thumbHalf = thumb[this.axis[axis].offsetSizeAttr] / 2;

            const thumbPositionPercentage =
                (offset - thumbHalf) * 100 / rail[this.axis[axis].offsetSizeAttr];

            this.$refs.wrapper[this.axis[axis].scrollOffsetAttr] =
                thumbPositionPercentage * this.$refs.wrapper[this.axis[axis].scrollSizeAttr] /
                100;
        },

        handleGetScrollbarSize(axis = 'y') {
            if (axis === 'y' && this.isYOverflowing || axis === 'x' && this.isXOverflowing) {
                const contentSize = this.$refs.content[this.axis[axis].scrollSizeAttr];
                const trackSize =
                    axis === 'y' ? this.$refs.yRail.offsetHeight : this.$refs.xRail.offsetWidth;

                const scrollbarRatio = trackSize / contentSize;

                const scrollbarSize = Math.max(~~(scrollbarRatio * trackSize), 20);

                return scrollbarSize;
            } else {
                return 0;
            }
        },
    },
};
</script>

<style lang="scss" module>
    $scrollbar-color: $violet;

    .VScrollBox {
        position: relative;
        overflow: hidden;

        .wrapper {
            position: absolute;
            top: 0;
            right: 0;
            bottom: 0;
            left: 0;
            z-index: 0;
            box-sizing: border-box;
            overflow: auto;
            width: auto;
            max-width: 100%;
            height: 100%;
            max-height: 100%;
            scrollbar-width: none;
            -ms-overflow-style: none;

            &::-webkit-scrollbar {
                width: 0;
                height: 0;
            }

            &._offset {
                padding-right: .4rem;
            }
        }

        .placeholder {
            width: 100%;
            max-width: 100%;
            max-height: 100%;
            pointer-events: none;
        }

        .fadeMask {
            position: absolute;
            top: 0;
            width: 100%;
            height: 100%;

            &:global {
                &._top {
                    &:before {
                        min-height: 0;
                    }
                }

                &._bottom {
                    &:after {
                        min-height: 0;
                    }
                }

                &._show {
                    &:before,
                    &:after {
                        display: block;
                    }
                }
            }

            &:before,
            &:after {
                content: "";
                position: absolute;
                left: 1px;
                z-index: 2;
                display: none;
                width: calc(100% - 1.2rem);
                min-height: 4rem;
                transition: min-height .2s linear;
                pointer-events: none;
            }

            &:before {
                top: 0;
                background: linear-gradient(to bottom, rgba(255 255 255) 12%, rgba(255 255 255 / 80%) 50%, rgba(255 255 255 / 0%));
            }

            &:after {
                bottom: 0;
                background: linear-gradient(to top, rgba(255 255 255) 12%, rgba(255 255 255 / 80%) 50%, rgba(255 255 255 / 0%));
            }
        }
    }

    .scrollbar {
        position: absolute;
        right: 0;
        bottom: 0;
        z-index: 3;
        overflow: hidden;
        width: .6rem;

        &._horizontal {
            left: 0;

            .thumb {
                bottom: .1rem;
                left: 0;
                height: .4rem;
            }
        }

        &._vertical {
            top: 0;
            margin: 1rem .3rem 1rem 0;

            .thumb {
                top: 0;
                right: .1rem;
                width: .4rem;
                transition: opacity $default-transition;
                cursor: pointer;

                &:hover {
                    opacity: .7;
                }
            }
        }

        .thumb {
            position: absolute;
            border-radius: .4rem;
            background-color: $scrollbar-color;
        }
    }
</style>
