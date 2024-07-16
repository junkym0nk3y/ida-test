<template>
    <div :class="[$style.ProjectsFilter, {[$style._modal]: isModal}]">
        <div :class="$style.filterItem">
            <div :class="$style.filterTitle">
                Город
            </div>

            <VSelect
                name="zone"
                :value="values.zone"
                :specs="specs.zone"
                :facets="facets.zone"
                @change="$emit('change', $event)"
            />
        </div>

        <div :class="$style.filterItem">
            <div :class="$style.filterTitle">
                Тип недвижимости
            </div>

            <VSelect
                name="propertyType"
                :value="values.propertyType"
                :specs="specs.propertyType"
                :facets="facets.propertyType"
                @change="$emit('change', $event)"
            />
        </div>

        <div :class="$style.filterItem">
            <div :class="$style.filterTitle">
                Срок сдачи
            </div>

            <VSelect
                name="deadlineYear"
                :value="values.deadlineYear"
                :specs="specs.deadlineYear"
                :facets="facets.deadlineYear"
                multiple
                @change="$emit('change', $event)"
            />
        </div>

        <div :class="$style.filterItem">
            <div :class="$style.filterTitle">
                Цена
            </div>

            <VRange
                :name="['price_min', 'price_max']"
                :specs="specs.price"
                :facets="facets.price"
                :value-min="values.price_min"
                :value-max="values.price_max"
                postfix="<span class='rub'>И</span>"
                show-label
                @change="$emit('change', $event)"
            />
        </div>
    </div>
</template>

<script>
export default {
    name: 'ProjectsFilter',

    props: {
        values: {
            type: Object,
            default: () => ({}),
        },

        specs: {
            type: Object,
            default: () => ({}),
        },

        facets: {
            type: Object,
            default: () => ({}),
        },

        isModal: Boolean,
    },
};
</script>

<style lang="scss" module>
    .ProjectsFilter {
        position: relative;

        &._modal {
            .filterItem {
                margin-top: 2rem;
            }
        }
    }

    .filterItem {
        flex: 1;
        margin-right: 2rem;

        &:last-child {
            margin-right: 0;
        }

        @include respond-to(tablet) {
            margin-top: 2rem;
            margin-right: 0;

            &:first-child {
                margin-top: 0;
            }
        }
    }

    .filterTitle {
        display: block;
        margin-bottom: 1.2rem;
        font-size: 1.2rem;
        line-height: 1;
        letter-spacing: -.005em;
        color: #9197a6;
    }
</style>
