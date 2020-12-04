<template>
    <div class="card card-body mb-2">
        <div class="container">
            <filter-box
                placeholder="enter to search for username..."
                :filter-value="filterValue"
                @update-filter-value="updateFilterValue($event)"
            >
                <template #filters>
                    <mode-filters
                        :filter-mode="filterMode"
                        @update-filter-mode="updateFilterMode($event)"
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
        </div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapState, mapActions } from 'vuex';
import FilterBox from '@components/FilterBox.vue';
import ModeFilters from '@components/ModeFilters.vue';

export default Vue.extend({
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
        };
    },
    computed: mapState('users', [
        'sortBy',
        'filterMode',
        'filterValue',
    ]),
    methods: {
        ...mapActions('users', [
            'updateSorting',
            'updateFilterValue',
            'updateFilterMode',
        ]),
    },
});
</script>
