import itemsJS from 'itemsjs/dist/itemsjs.min';

const sortingArr = ['zone', 'propertyType', 'deadlineYear', 'price_min', 'price_max', 'complete'];

const configuration = {
    aggregations: {
        zone: {
            title: 'zone',
            conjunction: true,
            hide_zero_doc_count: true,
            chosen_filters_on_top: false,
        },
        propertyType: {
            title: 'propertyType',
            conjunction: true,
            hide_zero_doc_count: true,
            chosen_filters_on_top: false,
        },
        deadlineYear: {
            title: 'deadlineYear',
            conjunction: true,
            hide_zero_doc_count: true,
            chosen_filters_on_top: false,
        },
        complete: {
            title: 'complete',
            conjunction: true,
            hide_zero_doc_count: true,
            chosen_filters_on_top: false,
        },
        price: {
            title: 'price',
            show_facet_stats: true,
        },
    },
};

export const handleSortParams = params => {
    const newParams = Object.keys(params)
        .filter(i => params[i] !== '')
        .sort((a, b) => sortingArr.indexOf(a) - sortingArr.indexOf(b))
        .reduce((res, key) => (res[key] = Array.isArray(params[key])
            ? params[key]
            : params[key].toString()
                .split(','), res), {});

    return newParams;
};

export const handleFlatsFilter = (array, params) => array.filter(p => {
    const checks = [];

    for (const [key, value] of Object.entries(params)) {
        if (value === '') {
            continue;
        }

        switch (key) {
            case 'price_min':
            case 'price_max':
                if (params.price_max && params.price_min) {
                    checks.push(Number(params.price_min) <= Number(p.price) <= Number(params.price_max));
                } else if (key === 'price_min') {
                    checks.push(Number(value) <= Number(p.price));
                } else {
                    checks.push(Number(p.price) <= Number(value));
                }
                break;
            default:
                if (Array.isArray(value)) {
                    const stringValues = value.map(String);
                    checks.push(stringValues.includes(p[key].toString()));
                } else {
                    checks.push(p[key].toString() === value.toString());
                }
        }
    }

    return !checks.includes(false);
});

export const handlePrepareSpecsFacets = (aggregations, facets = false) => {
    const preFacets = {};

    for (const [key, value] of Object.entries(aggregations)) {
        if (value) {
            const aggrs = aggregations[key].facet_stats || aggregations[key].buckets.map(i => i.key);
            preFacets[key] = aggrs;
        }
    }

    // // Массивы для подготовленных данных для передачи на фронт спеков
    // // т.к. их формат отличается от формата передачи фасетов
    let zoneChoices = [];
    let typeChoices = [];
    let completeChoices = [];
    let deadlineChoices = [];

    if (!facets) {
        // Словарь для зон недвижимоти
        const zoneTypes = {
            moscow: 'Москва',
            spb: 'Санкт-Петербург',
            krasnodar: 'Краснодар',
            ekt: 'Екатеринбург',
            tula: 'Тула',
            omsk: 'Омск',
            sochi: 'Сочи',
            tomsk: 'Томск',
        };

        // Словарь типа недвижимости
        const propertyTypes = {
            flat: 'Квартиру',
            parking: 'Паркинг',
            storage: 'Кладовую',
        };

        // Словарь сроков сдачи
        const completeTypes = {
            true: 'Сдан',
            false: 'Не сдан',
        };

        zoneChoices = preFacets.zone.map(elem => ({
            label: zoneTypes[elem],
            value: elem,
        }));


        typeChoices = preFacets.propertyType.map(elem => ({
            label: propertyTypes[elem],
            value: elem,
        }));

        completeChoices = preFacets.complete.map(elem => ({
            label: completeTypes[elem],
            value: elem,
        }));

        deadlineChoices = preFacets.deadlineYear.sort((a, b) => a - b)
            .map(elem => ({
                label: elem,
                value: elem,
            }));
    }

    return [
        {
            name: 'zone',
            choices: !facets ? zoneChoices : preFacets.zone,
        },
        {
            name: 'propertyType',
            choices: !facets ? typeChoices : preFacets.propertyType,
        },
        {
            name: 'complete',
            choices: !facets ? completeChoices : preFacets.complete,
        },
        {
            name: 'deadlineYear',
            choices: !facets ? deadlineChoices : preFacets.deadlineYear.sort((a, b) => a - b),
        },
        {
            name: 'price',
            range: {
                min: preFacets.price.min,
                max: preFacets.price.max,
            },
        },
    ];
};

export const handleFlatsSpecsFacets = (array, params, skipParams = [], facets = false) => {
    let items = [...array];
    const config = { ...configuration };
    let activeParams = {};

    // Подготавливаем параметры
    if (params) {
        activeParams = handleSortParams(params);
        delete activeParams.price_max;
        delete activeParams.price_min;
    }

    // Prefilter
    if (params.price_min || params.price_max) {
        items = handleFlatsFilter(items, {
            price_min: params?.price_min || '',
            price_max: params?.price_max || '',
        });
    }

    // Conjunction = true === AND || OR
    if (Object.keys(activeParams).length) {
        Object.keys(config.aggregations)
            .forEach(i => {
                if (config.aggregations[i].conjunction !== undefined) {
                    config.aggregations[i].conjunction = Boolean(!activeParams[i]);
                }
            });
    }

    // ItemsJS init
    const facetFilter = itemsJS(items, config);

    // Search items
    const filteredItems = facetFilter.search({
        // sort: 'price_asc',
        filters: activeParams,
    });

    // Prepare facets
    let preparedFacets = handlePrepareSpecsFacets(filteredItems.data.aggregations, facets);

    if (skipParams.length) {
        const newItems = itemsJS(items, configuration);

        const allItems = newItems.search({
            filters: {},
        });

        const allSpecs = handlePrepareSpecsFacets(allItems.data.aggregations, facets);
        preparedFacets = preparedFacets.map(obj => {
            // Оставляем заданные спеки, для отображения всех вариантов выбора
            if (skipParams.includes(obj.name)) {
                return allSpecs.find(o => o.name === obj.name) || obj;
            } else {
                return obj;
            }
        });
    }
    return preparedFacets;
};
