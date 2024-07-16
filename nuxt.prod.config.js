import commonModules from './config/modules/commonModules';
import prodModules from './config/modules/prodModules';

const nuxtProdConfig = {
    modules: [
        ...commonModules,
        ...prodModules,
    ],
};

export default nuxtProdConfig;
