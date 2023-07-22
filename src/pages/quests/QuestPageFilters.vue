<template>
    <div class="container card card-body py-3 mb-2">
        <filter-box
            placeholder="enter to search for quest..."
            @update:filterValue="updateFilterValue($event)"
        >
            <button
                class="btn btn-primary"
                data-bs-toggle="modal"
                data-bs-target="#submitQuest"
            >
                Submit quest for approval <i class="fas fa-plus fa-xs" />
            </button>

            <template #filters>
                <mode-filters
                    :filter-mode="filterMode"
                    @update:filterMode="filterByMode($event)"
                />

                <artist-filters
                    :filter-artist="filterArtist"
                    @update:filterArtist="filterByArtist($event)"
                />
            </template>
        </filter-box>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { mapActions, mapState } from 'vuex';
import FilterBox from '@components/FilterBox.vue';
import ModeFilters from '@components/ModeFilters.vue';
import ArtistFilters from '@components/ArtistFilters.vue';

export default defineComponent({
    components: {
        FilterBox,
        ModeFilters,
        ArtistFilters,
    },
    computed: {
        ...mapState([
            'loggedInUser',
        ]),
        ...mapState('quests', [
            'filterMode',
            'filterArtist',
        ]),
    },
    methods: {
        ...mapActions('quests', [
            'updateFilterValue',
            'updateFilterMode',
            'updateFilterArtist',
            'searchQuests',
        ]),
        filterByMode(e) {
            this.updateFilterMode(e);
            this.searchQuests();
        },
        filterByArtist(e) {
            this.updateFilterArtist(e);
            this.searchQuests();
        },
    },
});
</script>
