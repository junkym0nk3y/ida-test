<template>
    <transition
        duration="500"
        mode="out-in"
        name="modal"
        @before-enter="beforeEnter"
        @after-leave="afterLeave"
    >
        <div
            v-if="component"
            :key="key"
            :class="[$style.TheModal, classList]"
        >
            <div :class="$style.wrapper">
                <div
                    v-clickoutside="close"
                    :class="$style.container"
                    data-scroll-lock-scrollable
                >
                    <component
                        :is="component"
                        :key="key"
                        v-bind="attrs"
                        @change="onChange"
                        @close="close"
                    />
                </div>
            </div>
        </div>
    </transition>
</template>

<script>
// Vuex
import { mapActions } from 'vuex';

// Utils
import { disablePageScroll, enablePageScroll } from 'scroll-lock/dist/scroll-lock';

export default {
    name: 'TheModal',

    data() {
        return {
            component: null,
            attrs: null,
            onClose: null,
            key: null,
            isPopover: false,
        };
    },

    computed: {
        classList() {
            return [{
                [this.$style[`_${this.attrs?.position}`]]: this.attrs?.position,
                [this.$style._popover]: this.isPopover,
            }];
        },
    },

    beforeMount() {
        this.$modal.event.$on('open', this.open);
        this.$modal.event.$on('update', this.update);
        this.$modal.event.$on('close', this.close);
    },

    beforeDestroy() {
        this.$modal.event.$off('open', this.open);
        this.$modal.event.$off('update', this.update);
        this.$modal.event.$off('close', this.close);
        enablePageScroll();
        this.isPopover = false;
    },

    methods: {
        ...mapActions('header', [
            'setTransparent',
            'setMenuWithHero',
        ]),

        onChange(val) {
            this.$modal.event.$emit('change', val);
            if (val === 'reset') {
                this.close();
            }
        },

        open(component, attrs, onClose) {
            this.component = component;
            this.attrs = attrs;
            this.isPopover = this.attrs?.isPopover;
            this.onClose = onClose;
            this.key = Math.random();
            this.setTransparent(false);
        },

        update(attrs) {
            this.attrs = attrs;
        },

        close() {
            if (this.onClose) {
                this.onClose();
            }

            this.$modal.event.$off('change');
            this.component = this.attrs = this.onClose = this.key = null;
        },

        beforeEnter() {
            disablePageScroll();
        },

        afterLeave() {
            enablePageScroll();
            this.isPopover = false;
        },
    },
};
</script>

<style lang="scss" module>
    .TheModal {
        &._popover {
            z-index: calc(#{$header-z-index} - 10);

            &._left .wrapper {
                left: 0;
            }

            &._right .wrapper {
                right: 0;
            }

            .wrapper {
                position: absolute;
                width: 30rem;

                @include respond-to(mobile) {
                    width: 100vw;
                }
            }

            .container {
                position: absolute;
                bottom: 0;
                overflow: hidden;
                width: 100%;
            }
        }

        &._left {
            &:global(.modal-enter),
            &:global(.modal-leave-active) {
                .container {
                    transform: translate3d(-100%, 0, 0);
                }
            }
        }

        &._right {
            &:global(.modal-enter),
            &:global(.modal-leave-active) {
                .container {
                    transform: translate3d(100%, 0, 0);
                }
            }
        }

        &:global(.modal-enter-active),
        &:global(.modal-leave-to) {
            &:after {
                opacity: 1;
                transition: opacity .3s ease;
            }

            .container {
                opacity: 1;
                transform: translate3d(0, 0, 0);
                transition: opacity .2s ease .3s, transform .2s ease .3s;
            }
        }

        &:global(.modal-enter),
        &:global(.modal-leave-active) {
            &:after {
                opacity: 0;
                transition: opacity .3s ease .2s;
            }

            .container {
                opacity: 0;
                transform: translate3d(100%, 0, 0);
                transition: opacity .2s ease, transform .2s ease;

                @include respond-to(tablet) {
                    transform: translate3d(0, 100%, 0);
                }
            }
        }

        &:after {
            content: "";
            position: absolute;
            top: 0;
            right: 0;
            bottom: 0;
            left: 0;
            z-index: 1;
            background-color: rgba($base-400, .4);
        }

        .wrapper {
            position: relative;
            z-index: 2;
            display: flex;
            align-items: flex-start;
            justify-content: flex-end;
            width: 100%;
            height: 100%;
        }

        .container {
            overflow-y: auto;
            display: block;
            width: 51.6rem;
            height: 100%;
            background-color: #fff;

            @include respond-to(tablet) {
                width: 44rem;
            }

            @include respond-to(mobile) {
                position: absolute;
                bottom: 0;
                width: 100%;
            }
        }
    }
</style>
