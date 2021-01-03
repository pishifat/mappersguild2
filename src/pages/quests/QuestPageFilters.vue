<template>
    <div class="container card card-body py-3 mb-2">
        <filter-box
            placeholder="enter to search for quest..."
            @update:filterValue="updateFilterValue($event)"
        >
            <button
                class="btn btn-primary"
                :disabled="!validRank"
                :data-bs-toggle="validRank ? 'modal' : 'tooltip'"
                :title="!validRank ? 'designing custom quests is available to tier 1+ users only' : ''"
                :data-bs-target="validRank ? '#submitQuest' : ''"
            >
                Submit quest for approval <i class="fas fa-plus fa-xs" />
            </button>

            <template #filters>
                <mode-filters
                    :filter-mode="filterMode"
                    @update:filterMode="searchQuests($event)"
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

export default defineComponent({
    components: {
        FilterBox,
        ModeFilters,
    },
    computed: {
        ...mapState([
            'loggedInUser',
        ]),
        ...mapState('quests', [
            'filterMode',
        ]),
        validRank(): boolean {
            return this.loggedInUser.rank >= 1;
        },
    },
    methods: mapActions('quests', [
        'updateFilterValue',
        'searchQuests',
    ]),
});
</script>
