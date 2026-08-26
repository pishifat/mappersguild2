<template>
    <div class="container card card-body py-3 mb-2">
        <filter-box
            placeholder="enter to search..."
            :filter-value="filterValue"
            @update:filterValue="updateFilterValue($event)"
        >
            <button
                class="btn btn-primary"
                data-bs-toggle="modal"
                data-bs-target="#addBackground"
            >
                Submit a background <i class="fas fa-plus fa-xs" />
            </button>
        </filter-box>

        <div class="row small mt-3">
            <div class="col-auto filter-title">
                Sort
            </div>
            <div class="col">
                <a
                    v-for="(sortText, sort) in sortOptions"
                    :key="sort"
                    href="#"
                    :class="sortBy === sort ? 'sorted' : 'unsorted'"
                    @click.prevent="updateSorting(sort)"
                >
                    {{ sortText }}
                </a>
            </div>
        </div>

        <div class="row small mt-3">
            <div class="col-auto filter-title">
                Creator
            </div>
            <div class="col">
                <a
                    v-for="(creatorText, creator) in creatorOptions"
                    :key="creator"
                    href="#"
                    :class="filterCreator === creator ? 'sorted' : 'unsorted'"
                    @click.prevent="updateFilterCreator(creator)"
                >
                    {{ creatorText }}
                </a>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { mapState, mapActions } from 'vuex';
import FilterBox from '@components/FilterBox.vue';

export default defineComponent({
    name: 'BackgroundPageFilters',
    components: {
        FilterBox,
    },
    data () {
        return {
            sortOptions: {
                newest: 'Newest',
                oldest: 'Oldest',
            },
            creatorOptions: {
                any: 'Any',
                me: 'Me',
            },
        };
    },
    computed: {
        ...mapState('backgrounds', [
            'filterValue',
            'sortBy',
            'filterCreator',
        ]),
    },
    methods: {
        ...mapActions('backgrounds', [
            'updateFilterValue',
            'updateSorting',
            'updateFilterCreator',
        ]),
    },
});
</script>
