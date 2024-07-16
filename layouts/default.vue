<template>
    <div
        id="app"
        :class="$style.DefaultLayout"
    >
        <TheHeader />

        <main :class="$style.main">
            <Nuxt />
        </main>

        <!--        <TheFooter />-->
        <TheModal :class="$style.modal" />
    </div>
</template>

<script>
// Components
import TheHeader from '~/components/layout/TheHeader';
import TheModal from '~/components/layout/TheModal';

export default {
    name: 'DefaultLayout',
    components: {
        TheHeader,
        TheModal,
    },
};
</script>

<style lang="scss" module>
    .DefaultLayout {
        max-width: calc(100% - var(--lock-offset, 0));
    }

    .main {
        position: relative;
        min-height: calc(100vh - #{$footer-h});
        /* stylelint-disable */
        min-height: -webkit-fill-available;
        /* stylelint-enable */
    }

    .modal {
        position: fixed;
        top: 0;
        right: 0;
        bottom: 0;
        left: 0;
        z-index: 1000;
    }
</style>
