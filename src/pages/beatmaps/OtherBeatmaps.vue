<template>
    <div class="container bg-container py-3">
        <h5 class="ml-2">
            <a href="#otherBeatmaps" data-toggle="collapse">
                Other beatmaps ({{ otherBeatmaps ? otherBeatmaps.length : '...' }})
                <i class="fas fa-angle-down" />
            </a>
            <span v-if="isLoading" class="text-white-50" style="font-size: 9pt;">loading...</span>
        </h5>

        <div v-if="otherBeatmaps" id="otherBeatmaps" class="collapse">
            <p v-if="!otherBeatmaps.length" class="ml-5 text-white-50">
                None...
            </p>

            <beatmap-table-row
                v-for="beatmap in otherBeatmaps"
                :key="beatmap.id"
                :beatmap="beatmap"
                :user-osu-id="userOsuId"
            />

            <div class="text-center">
                <button
                    class="btn btn-sm btn-outline-info my-4"
                    data-toggle="tooltip"
                    data-placement="top"
                    title="toggle visibility of less active beatmaps"
                    @click.prevent="showMore($event)"
                >
                    <i class="fas fa-angle-down mr-1" /> show older beatmaps <i class="fas fa-angle-down ml-1" />
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
    data () {
        return {
            isLoading: false,
        };
    },
    computed: mapState({
        otherBeatmaps: 'allBeatmaps',
        userOsuId: 'userOsuId',
    }),
    methods: {
        showMore(e): void {
            this.$emit('update:fetch-limit');
            this.$emit('load-beatmaps', e);
        },
    },
});
</script>