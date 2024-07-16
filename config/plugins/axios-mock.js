// Mock
import MockAdapter from 'axios-mock-adapter';

// Json
import * as projectsData from '~/assets/mock/json/projects';
import * as flatsData from '~/assets/mock/json/allFlats';

// Утилиты для формирование спеков и данных для запросов фильтра
import {
    handleFlatsFilter,
    handleFlatsSpecsFacets,
} from '~/assets/mock/js/mock-utils';

// Получаем из json все проекты
const [...projects] = projectsData.projects;

// Вся недвижимость, для фильтрации
const [...allFlats] = flatsData.allFlats;

export default ({ $axios }) => {
    // Подключение адаптера mockup и эндпонитов
    const mock = new MockAdapter($axios);

    mock.onGet('/api/projects/')
        .reply(config => {
            const filteredItems = config?.params ? handleFlatsFilter(allFlats, config.params) : allFlats;
            const projectsArr = [...new Set(filteredItems.map(i => i.project))];
            return [202, projects.filter(i => projectsArr.includes(i.slug))];
        });

    mock.onGet('/api/projects/facets/')
        .reply(config => {
            const skipParams = ['zone'];
            const facets = handleFlatsSpecsFacets(allFlats, config?.params || {}, skipParams, true);
            return [202, facets];
        });

    mock.onGet('/api/projects/specs/')
        .reply(config => {
            const skipParams = ['zone', 'propertyType'];
            const specs = handleFlatsSpecsFacets(allFlats, config?.params || {}, skipParams);
            return [202, specs];
        });
    mock.onAny()
        .passThrough();
};
