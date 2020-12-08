<template>
    <div id="mapsetStatus" class="form-group">
        <div class="d-inline-block mr-2">
            Status
        </div>

        <button
            class="btn btn-sm"
            :class="beatmap.status == 'Done' ? 'btn-success' : 'btn-outline-success'"
            :disabled="beatmap.status == 'Done'"
            data-toggle="tooltip"
            data-placement="bottom"
            title="mark mapset and all diffs as done"
            @click="setStatus('Done', $event)"
        >
            Done
        </button>

        <button
            class="btn btn-sm"
            :class="beatmap.status == 'WIP' ? 'btn-warning' : 'btn-outline-warning'"
            :disabled="beatmap.status == 'WIP'"
            data-toggle="tooltip"
            data-placement="bottom"
            title="mark mapset as work-in-progress"
            @click="setStatus('WIP', $event)"
        >
            WIP
        </button>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { Beatmap } from '../../../../interfaces/beatmap/beatmap';

export default Vue.extend({
    name: 'StatusChoice',
    props: {
        beatmap: {
            type: Object as () => Beatmap,
            required: true,
        },
    },
    methods: {
        async setStatus(status, e): Promise<void> {
            const beatmap = await this.executePost<Beatmap>(
                `/beatmaps/${this.beatmap.id}/setStatus`,
                { status },
                e
            );

            if (!this.isError(beatmap)) {
                this.$store.dispatch('beatmaps/updateBeatmap', beatmap);
            }
        },
    },
});
</script>
