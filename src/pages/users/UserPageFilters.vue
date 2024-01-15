<template>
    <div class="card card-body mb-2">
        <div class="container">
            <filter-box
                placeholder="enter to search for username..."
                :filter-value="filterValue"
                @update:filterValue="updateFilterValue($event)"
            >
                <template #filters>
                    <mode-filters
                        :filter-mode="filterMode"
                        @update:filterMode="updateFilterMode($event)"
                    />
                </template>
            </filter-box>

            <div class="row small mt-3">
                <div class="col-auto filter-title">
                    Sort
                </div>

                <div class="col">
                    <a
                        v-for="(sortText, sort) in sortOptions"
                        :key="sort"
                        :class="sortBy === sort ? 'sorted' : 'unsorted'"
                        href="#"
                        @click.prevent="updateSorting(sort)"
                    >
                        {{ sortText }}
                    </a>
                </div>
            </div>

            <div class="row small mt-3">
                <div class="col-auto filter-title">
                    Display
                </div>

                <div class="col">
                    <a
                        v-for="(displayText, display) in displayOptions"
                        :key="display"
                        :class="displayAs === display ? 'sorted' : 'unsorted'"
                        href="#"
                        @click.prevent="updateDisplay(display)"
                    >
                        {{ displayText }}
                    </a>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { mapState, mapActions } from 'vuex';
import FilterBox from '@components/FilterBox.vue';
import ModeFilters from '@components/ModeFilters.vue';

export default defineComponent({
    name: 'UserPageFilters',
    components: {
        FilterBox,
        ModeFilters,
    },
    data () {
        return {
            sorted: false,
            sortOptions: {
                username: 'Name',
                rank: 'Rank',
                createdAt: 'Joined',
            },
            displayOptions: {
                list: 'List',
                cards: 'Cards',
            },
        };
    },
    computed: mapState('users', [
        'sortBy',
        'displayAs',
        'filterMode',
        'filterValue',
    ]),
    methods: {
        ...mapActions('users', [
            'updateDisplay',
            'updateSorting',
            'updateFilterValue',
            'updateFilterMode',
        ]),
    },
});
</script>
