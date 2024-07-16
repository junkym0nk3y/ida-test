<template>
    <component
        :is="isLoader ? 'div' : 'nuxt-link'"
        :class="['project-card', $style.ProjectCard, {[$style._loading]: isLoader}]"
        :to="project && project.slug ? `/projects/${project.slug}/` : ''"
    >

        <div
            v-if="isLoader || !project"
            :class="$style.cardWrapper"
            class="card-wrapper"
        >
        </div>

        <template v-else>
            <div :class="[$style.cardWrapper, {[$style._reload]: isReloading}]">
                <transition name="fade-fast">
                    <div
                        v-show="!isReloading"
                        :class="$style.cardMain"
                    >
                        <img
                            :class="$style.cardImage"
                            :src="project.image_display"
                        />

                        <div :class="$style.info">
                            <div :class="$style.infoWrapper">

                                <div
                                    :class="$style.name"
                                    v-html="project.name"
                                >
                                </div>

                                <div
                                    v-if="project.address"
                                    :class="$style.description"
                                    v-html="project.address"
                                >
                                </div>

                                <div
                                    :class="$style.description"
                                    v-html="project.description"
                                >
                                </div>

                                <div
                                    v-if="project.min_mortgage"
                                    :class="$style.price"
                                >
                                    От {{ project.min_mortgage|splitThousands }} ₽/мес
                                </div>
                            </div>
                        </div>
                    </div>
                </transition>
                <slot></slot>
            </div>
        </template>
    </component>
</template>

<script>
export default {
    name: 'ProjectCard',

    props: {
        project: {
            type: Object,
            default: () => ({}),
        },

        isLoader: {
            type: Boolean,
            default: false,
        },
    },

    data() {
        return {
            isReloading: false,
            interval: null,
        };
    },
};
</script>

<style lang="scss" module>
    $base-dark: #23252d;
    $blue-hovered: #4376ed;

    .ProjectCard {
        position: relative;
        overflow: hidden;
        display: flex;
        flex-grow: 1;
        width: 33.3%;
        height: 50rem;
        padding: .8rem;
        user-select: none;

        &:nth-child(-n+3) {
            flex-grow: 0;
        }

        &._loading {
            .cardWrapper {
                &:after {
                    content: "";
                    position: absolute;
                    top: -110%;
                    left: -210%;
                    width: 200%;
                    height: 200%;
                    /* stylelint-disable */
                    background: linear-gradient(
                            to right,
                            rgba(255, 255, 255, .13) 0%,
                            rgba(255, 255, 255, .13) 77%,
                            rgba(255, 255, 255, .5) 92%,
                            rgba(255, 255, 255, 0) 100%
                    );
                    /* stylelint-enable */
                    opacity: 0;
                    transform: rotate(30deg);
                    animation: shine 2s ease-out infinite;
                    animation-fill-mode: forwards;
                }
            }
        }

        &:hover {
            .cardWrapper {
                border-radius: 5.6rem;
            }
        }

        @include respond-to(tablet) {
            width: 50%;
            height: 42rem;
            padding: .6rem;

            &:hover {
                .cardWrapper {
                    border-radius: 0;
                }
            }
        }

        @include respond-to(mobile) {
            width: 100%;
            height: 19.8rem;
            margin-bottom: 1.2rem;
            padding: 0;

            &:last-child {
                margin-bottom: 0;
            }
        }

        @keyframes shine {
            10% {
                top: -30%;
                left: -30%;
                opacity: 1;
                transition-duration: .7s, .7s, .15s;
                transition-property: left, top, opacity;
                transition-timing-function: ease;
            }

            100% {
                top: -30%;
                left: -30%;
                opacity: 0;
                transition-property: left, top, opacity;
            }
        }
    }

    .cardWrapper {
        position: relative;
        overflow: hidden;
        width: 100%;
        height: 100%;
        border-radius: .5rem;
        background-position: center;
        background-size: cover;
        transform: translate3d(0, 0, 0);
        transition: border-radius .2s linear, filter .2s ease-in;

        .cardMain {
            position: relative;
            width: 100%;
            height: 100%;
            transition: background .2s ease;

            & > div {
                width: 100%;
                height: 100%;
            }

            &:after {
                content: "";
                position: absolute;
                bottom: 0;
                left: 0;
                width: 100%;
                height: 100%;
                /* stylelint-disable */
                background: linear-gradient(
                        360deg,
                        rgba(0, 0, 0, .72) 0%,
                        rgba(0, 0, 0, .7) 10%,
                        rgba(0, 0, 0, .62) 20%,
                        rgba(0, 0, 0, .48) 30%,
                        rgba(0, 0, 0, .32) 40%,
                        rgba(0, 0, 0, .17) 55%,
                        rgba(0, 0, 0, .05) 60%,
                        rgba(0, 0, 0, 0) 70%
                );
                /* stylelint-enable */
                opacity: 1;
                transition: opacity .2s linear;

                @include respond-to(mobile) {
                    background: #000;
                    opacity: .25;
                }
            }
        }

        img.cardImage {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }
    }

    .info {
        position: absolute;
        bottom: 0;
        left: 0;
        z-index: 2;
        display: flex;
        flex-flow: column nowrap;
        padding: 0 3.2rem 3.2rem 3.2rem;

        @include respond-to(mobile) {
            top: 0;
            bottom: initial;
            height: 100%;
            padding: 1.6rem;
        }
    }

    .infoWrapper {
        display: flex;
        flex-direction: column;
        justify-content: flex-end;
        flex: 1;
        min-height: 11.7rem;

        .name {
            margin-top: 1.6rem;
            text-transform: uppercase;
            font-size: 3.2rem;
            font-weight: 500;
            line-height: 3.6rem;
            letter-spacing: -.015em;
            color: #fff;

            @include respond-to(tablet) {
                font-size: 2.4rem;
                line-height: 2.8rem;
            }

            @include respond-to(mobile) {
                min-height: auto;
                margin-top: .8rem;
                font-size: 1.4rem;
                line-height: 1.4rem;
                letter-spacing: -.01em;
            }
        }

        .description {
            margin-top: 1.6rem;
            font-size: 1.4rem;
            letter-spacing: -.01em;
            color: #fff;
            opacity: .72;

            @include respond-to(mobile) {
                display: none;
            }
        }

        .price {
            margin-top: 1.6rem;
            text-transform: uppercase;
            font-size: 1.6rem;
            line-height: 1.6rem;
            letter-spacing: -.01em;
            color: #fff;

            @include respond-to(tablet) {
                margin-top: 1.4rem;
            }

            @include respond-to(mobile) {
                font-size: 1rem;
                line-height: 1.2rem;
                letter-spacing: -.005em;
            }
        }

        @include respond-to(mobile) {
            height: 100%;
            flex-direction: column-reverse;
        }
    }

    .timeLeft {
        margin-top: 3.2rem;
        text-transform: uppercase;
        font-size: 1rem;
    }

    .buttons {
        position: absolute;
        top: 3.2rem;
        left: 3.2rem;
        z-index: 5;
        display: flex;

        .button {
            display: flex;
            align-items: center;
            justify-content: center;
            margin-right: .8rem;
            color: #fff;
            transition: color .2s ease, background-color .2s ease;

            &:last-child {
                margin-right: 0;
            }
        }

        .buttonMapPoint {
            color: $base-dark;

            &:hover {
                background-color: $base-dark;
                color: #fff;
            }
        }

        .buttonGift {
            background: $blue-hovered;

            &:hover {
                background: $blue-hovered;
            }
        }

        @include respond-to(mobile) {
            display: none;
        }
    }
</style>
