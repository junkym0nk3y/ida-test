<template>
    <header
        :class="[$style.TheHeader, classList]"
        data-scroll-lock-fill-gap
    >
        <div :class="['container', $style.wrapper]">
            <div :class="$style.logoWrapper">
                <LogoIda
                    to="/"
                    color="white"
                    @click.native="handleLogoClick"
                />
            </div>
        </div>
    </header>
</template>

<script>
// Vuex
import { mapState, mapActions } from 'vuex';

// Utils
import { throttle, remToPx } from '~/assets/js/utils/common-utils';

// Variables
import scssVars from '~/assets/scss/shared/_variables.scss';

// Components
import LogoIda from '~/components/common/LogoIda';

export default {
    name: 'TheHeader',

    components: {
        LogoIda,
    },

    data() {
        return {
            throttleScroll: null,
            isTicking: false,
            lastScroll: 0,
            isInit: false,
        };
    },

    computed: {
        ...mapState('header', [
            'isVisible',
            'isScrolled',
            'isTransparent',
        ]),

        classList() {
            return [{
                [this.$style._transparent]: this.isTransparent,
                [this.$style._scrolled]: this.isScrolled && this.isVisible && !this.isTransparent,
                [this.$style._hidden]: !this.isVisible,
            }];
        },
    },

    mounted() {
        this.$nextTick(() => {
            this.handleInit();
        });
    },

    beforeDestroy() {
        this.handleDestroy();
    },

    methods: {
        ...mapActions('header', [
            'setTransparent',
            'setScrolled',
            'changeVisibility',
        ]),

        /**
         * Инициализация, добавление слушателя на скролл (на mounted)
         * @public
         */
        handleInit() {
            this.lastScroll = document.documentElement.scrollTop;
            this.throttleScroll = throttle(this.onScroll, 300);
            window.addEventListener('scroll', this.throttleScroll);
        },

        /**
         * Удаляем слушатели из памяти (на beforeDestroy)
         * @public
         */
        handleDestroy() {
            if (this.throttleScroll) {
                this.throttleScroll = null;
            }

            window.removeEventListener('scroll', this.throttleScroll);
        },

        /**
         * Через requestAnimationFrame оптимизируем изменения состояний
         * @public
         */
        onScroll() {
            if (!this.isTicking) {
                this.isTicking = true;
                requestAnimationFrame(this.handleUpdateState);
            }
        },

        /**
         * Метод отвечающий за изменения состояния меню на скролле
         * Разбито на две хелпера, потому что логика на некоторых порталах достаточно объёмная
         * и с одним будет в этом случае трудно работать
         * @public
         */
        async handleUpdateState() {
            await Promise.all([
                this.handleCheckScroll(),
                this.handleCheckMenu(),
            ]);

            this.isTicking = false;
        },

        /**
         * Определяем есть ли скролл вообще, для изменения прозрачности меню и отключение тени
         * @public
         */
        async handleCheckScroll() {
            const isTop = document.documentElement.scrollTop <= 1;
            this.setScrolled(!isTop);
        },

        /**
         * Отслеживаем, что положение окна ниже положения меню.
         * Для этого получаем данные из _variables.scss с помощью небольшого хака,
         * затем rem конвертируется в px
         * @public
         */
        async handleCheckMenu() {
            const menuHeightRem = scssVars[`header-${this.$deviceIs.device}`];
            const isMoreMenuHeight = document.documentElement.scrollTop >= remToPx(menuHeightRem);

            if (isMoreMenuHeight) {
                if (document.documentElement.scrollTop > this.lastScroll) {
                    if (this.isVisible) {
                        this.changeVisibility(false);
                    }
                } else if (!this.isVisible) {
                    this.changeVisibility(true);
                }
                this.lastScroll = document.documentElement.scrollTop;
            } else {
                this.changeVisibility(true);
            }
        },

        /**
         * Закрываем модальку если переходим на главную через логотип
         * @public
         */
        handleLogoClick() {
            this.$modal.close();
        },
    },
};
</script>

<style lang="scss" module>
    .TheHeader {
        position: fixed;
        top: 0;
        z-index: $header-z-index;
        width: 100%;
        height: $header-h;
        background: $base-900;
        box-shadow: 0 2px 8px rgba(0 0 0 / 0%);
        transition: background-color $default-transition, box-shadow $default-transition, transform .3s linear;

        &._transparent {
            background-color: transparent;
            box-shadow: none;
        }

        &._scrolled {
            box-shadow: 0 8px 8px rgba(0 0 0 / 8%);
        }

        &._hidden {
            transform: translateY(-100%);
        }

        .wrapper {
            display: flex;
            align-items: center;
            height: 6.2rem;
        }
    }

    .logoWrapper {
        display: flex;
        align-items: center;
        justify-content: center;
        height: inherit;
        color: #fff;
    }
</style>
