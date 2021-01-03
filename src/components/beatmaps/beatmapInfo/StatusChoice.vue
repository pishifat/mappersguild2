<template>
    <div id="mapsetStatus" class="mb-3">
        <div class="d-inline-block me-2">
            Status
        </div>

        <button
            v-bs-tooltip:bottom="'mark mapset and all diffs as done'"
            class="btn btn-sm me-1"
            :class="beatmap.status == 'Done' ? 'btn-success' : 'btn-outline-success'"
            :disabled="beatmap.status == 'Done'"
            @click="setStatus('Done', $event)"
        >
            Done
        </button>

        <button
            v-bs-tooltip:bottom="'mark mapset as work-in-progress'"
            class="btn btn-sm me-1"
            :class="beatmap.status == 'WIP' ? 'btn-warning' : 'btn-outline-warning'"
            :disabled="beatmap.status == 'WIP'"
            @click="setStatus('WIP', $event)"
        >
            WIP
        </button>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { Beatmap } from '../../../../interfaces/beatmap/beatmap';

export default defineComponent({
    name: 'StatusChoice',
    props: {
        beatmap: {
            type: Object as () => Beatmap,
            required: true,
        },
    },
    methods: {
        async setStatus(status, e): Promise<void> {
            const beatmap = await this.$http.executePost<Beatmap>(
                `/beatmaps/${this.beatmap.id}/setStatus`,
                { status },
                e
            );

            if (!this.$http.isError(beatmap)) {
                this.$store.dispatch('beatmaps/updateBeatmap', beatmap);
            }
        },
    },
});
</script>
