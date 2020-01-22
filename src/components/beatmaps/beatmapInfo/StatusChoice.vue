<template>
    <div id="mapsetStatus" class="form-group">
        <div class="d-inline-block mr-2">
            Status
        </div>

        <button
            class="btn btn-sm"
            :class="selectedBeatmap.status == 'Done' ? 'btn-success' : 'btn-outline-success'"
            :disabled="selectedBeatmap.status == 'Done'"
            data-toggle="tooltip"
            data-placement="bottom"
            title="mark mapset and all diffs as done"
            @click="setStatus('Done', $event)"
        >
            Done
        </button>

        <button
            class="btn btn-sm"
            :class="selectedBeatmap.status == 'WIP' ? 'btn-warning' : 'btn-outline-warning'"
            :disabled="selectedBeatmap.status == 'WIP'"
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
import { mapState } from 'vuex';

export default Vue.extend({
    name: 'StatusChoice',
    computed: {
        ...mapState([
            'selectedBeatmap',
        ]),
    },
    methods: {
        async setStatus(status, e): Promise<void> {
            const beatmap = await this.executePost(
                '/beatmaps/setStatus/' + this.selectedBeatmap._id,
                { status },
                e
            );

            if (this.isError(beatmap)) {
                this.$emit('update:info', beatmap.error);
            } else {
                this.$store.dispatch('updateBeatmap', beatmap);
            }
        },
    },
});
</script>
