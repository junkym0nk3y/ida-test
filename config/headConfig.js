import {
    faviconsLinks,
    faviconsMeta,
} from './head/favicons';

const headConfig = {
    htmlAttrs: { lang: 'ru' },

    title: 'IDA Project',

    // Head meta
    meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },

        { hid: 'description', name: 'description', content: 'Site description' },
        { name: 'theme-color', content: '#111' },
        { name: 'apple-mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' },

        // Favicons
        ...faviconsMeta,
    ],

    // Head links
    link: [
        // Favicons
        ...faviconsLinks,
    ],
};

export default headConfig;
