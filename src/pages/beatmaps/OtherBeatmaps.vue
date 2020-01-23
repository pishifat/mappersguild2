<template>
    <div class="container bg-container py-3">
        <h5 class="ml-2">
            <a href="#otherBeatmaps" data-toggle="collapse">
                Other beatmaps ({{ otherBeatmaps && !isLoadingOtherBeatmaps ? otherBeatmaps.length : '...' }})
                <i class="fas fa-angle-down" />
            </a>
        </h5>

        <div
            v-if="otherBeatmaps"
            id="otherBeatmaps"
            class="collapse"
            :style="isLoadingOtherBeatmaps ? 'opacity: 0.3': ''"
        >
            <p v-if="!otherBeatmaps.length && !isLoadingOtherBeatmaps" class="ml-5 text-white-50">
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
                    <i class="fas fa-angle-down mr-1" /> show more <i class="fas fa-angle-down ml-1" />
                </button>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapState } from 'vuex';
import BeatmapTableRow from '../../components/beatmaps/BeatmapTableRow.vue';

export default Vue.extend({
    components: {
        BeatmapTableRow,
    },
    computed: mapState({
        otherBeatmaps: 'allBeatmaps',
        userOsuId: 'userOsuId',
        isLoadingOtherBeatmaps: 'isLoadingOtherBeatmaps',
        filterValue: 'filterValue',
    }),
    methods: {
        async showMore(e): Promise<void> {
            e.target.disabled = true;
            this.$store.commit('increaseFetchLimit');
            await this.$store.dispatch('loadOthersBeatmaps');
            e.target.disabled = false;
        },
    },
});
</script>