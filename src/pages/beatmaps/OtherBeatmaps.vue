<template>
    <div class="container card card-body py-3">
        <h5 class="ms-2">
            <a href="#otherBeatmaps" data-bs-toggle="collapse">
                Other beatmaps ({{ otherBeatmaps && !isLoadingOtherBeatmaps ? otherBeatmaps.length : '...' }})
                <i class="fas fa-angle-down" />
            </a>
        </h5>

        <div
            v-if="otherBeatmaps"
            id="otherBeatmaps"
            class="collapse"
        >
            <div :class="{ 'loading-data' : isLoadingOtherBeatmaps }">
                <p v-if="!otherBeatmaps.length && !isLoadingOtherBeatmaps" class="ms-5 text-secondary">
                    None...
                </p>

                <beatmap-table-row
                    v-for="beatmap in otherBeatmaps"
                    :key="beatmap.id"
                    :beatmap="beatmap"
                />

                <div v-if="!filterValue" class="text-center">
                    <button
                        class="btn btn-sm btn-outline-info my-4"
                        @click.prevent="showMore($event)"
                    >
                        <i class="fas fa-angle-down me-1" /> show more <i class="fas fa-angle-down ms-1" />
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { mapState } from 'vuex';
import BeatmapTableRow from '@components/beatmaps/BeatmapTableRow.vue';

export default defineComponent({
    components: {
        BeatmapTableRow,
    },
    computed: mapState('beatmaps', {
        otherBeatmaps: 'allBeatmaps',
        isLoadingOtherBeatmaps: 'isLoadingOtherBeatmaps',
        filterValue: 'filterValue',
    }),
    methods: {
        async showMore(e): Promise<void> {
            e.target.disabled = true;
            this.$store.commit('beatmaps/increaseFetchLimit');
            await this.$store.dispatch('beatmaps/loadOtherBeatmaps');
            e.target.disabled = false;
        },
    },
});
</script>