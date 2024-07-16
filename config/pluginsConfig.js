const pluginsConfig = [
    '~/config/plugins/axios',
    '~config/plugins/axios-mock', // mockup adapter for axios
    '~/config/plugins/filters', // vue filters
    '~/config/plugins/modal',
    '~/config/plugins/api',
    {
        src: '~/directives/index', mode: 'client',
    },
];

export default pluginsConfig;
