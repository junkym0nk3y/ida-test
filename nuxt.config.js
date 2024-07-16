import nuxtDevConfig from './nuxt.dev.config';
import nuxtProdConfig from './nuxt.prod.config';
import headConfig from './config/headConfig';
import pluginsConfig from './config/pluginsConfig';

const isDev = process.env.NODE_ENV === 'development';


// NuxtDeviceIs breakpoints
const breakpoints = {
    mobile: 767,
    tablet: 1279,
    laptop: 1439,
    desktop: 999999,
};

module.exports = {
    telemetry: false,

    // /////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // MAIN SECTION
    // /////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    // Server settings
    server: {
        port: 2222,
        host: '0.0.0.0',
    },

    render: {
        http2: {
            push: true,
        },

        resourceHints: false,
    },

    // Router settings
    router: {
        linkActiveClass: '_active-link',
        linkExactActiveClass: '_exact-link',
    },

    loading: {
        color: '#d9ff6c', height: '2px', throttle: 0,
    },

    // Head section
    head: headConfig,

    // Plugins
    plugins: pluginsConfig,

    // Public env config
    publicRuntimeConfig: {
        IS_DEV: isDev,
    },

    // /////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // MAIN CONFIG EXTENDS
    // /////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    ...isDev ? nuxtDevConfig : nuxtProdConfig,

    // /////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // MODULES SECTION
    // /////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    buildModules: ['@nuxtjs/svg-sprite'],

    // Auto import UI components
    components: [{
        path: '~/components/ui',
        extensions: ['vue'],
        pathPrefix: false,
        isAsync: true,
        prefetch: !isDev,
    }],

    // Disabled _icons page from svgSprite
    svgSprite: {
        iconsPath: null,
    },

    // NuxtDeviceIs breakpoints
    NuxtDeviceIs: {
        breakpoints,
    },

    // Global CSS
    css: [
        '~/assets/scss/bundle.scss',
        '~/assets/scss/vendors.scss',
        '~/assets/scss/default.scss',
    ],

    styleResources: {
        scss: '~/assets/scss/shared/*.scss',
        hoistUseStatements: true,
    },

    // /////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // BUILD SECTION
    // /////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    build: {
        publicPath: '/n/',

        analyze: isDev,

        // Set libraries to transpile by babel
        transpile: !isDev && [],

        babel: {
            presets({ envName }) {
                return [
                    [
                        '@nuxt/babel-preset-app',
                        {
                            corejs: { version: 3 },
                        },
                    ],
                ];
            },
        },

        loaders: {
            scss: {
                sourceMap: isDev,
            },
            vue: {
                cacheBusting: false,
            },
        },

        // Terser settings
        terser: !isDev && {
            terserOptions: {
                mangle: {
                    safari10: true,
                },
            },
        },

        // Postcss settings
        postcss: !isDev && {
            preset: {
                autoprefixer: {
                    grid: true,
                },
            },
        },

        extend(config, ctx) {
            // Fixes npm packages that depend on `fs` module
            config.node = {
                fs: 'empty',
            };
        },
    },
};
