<template>
    <div class="form-group" id="mapsetStatus">
        <div class="d-inline-block mr-2">
            Status
        </div>
        <button
            class="btn btn-sm btn-outline-success"
            :disabled="beatmap.status == 'Done'"
            @click="setStatus('Done', $event)"
            data-toggle="tooltip"
            data-placement="bottom"
            title="mark mapset and all diffs as done"
        >
            Done
        </button>
        <button
            class="btn btn-sm btn-outline-warning"
            :disabled="beatmap.status == 'WIP'"
            @click="setStatus('WIP', $event)"
            data-toggle="tooltip"
            data-placement="bottom"
            title="mark mapset as work-in-progress"
        >
            WIP
        </button>
    </div>
</template>

<script>
import mixin from '../../../mixins.js';

export default {
    name: 'status-choice',
    mixins: [ mixin ],
    props: {
        beatmap: Object,
    },
    methods: {
        setStatus: async function(status, e) {
            const beatmap = await this.executePost(
                '/beatmaps/setStatus/' + this.beatmap._id,
                { status },
                e
            );

            if (bm) {
                this.$emit('update:beatmap', beatmap);
    
                // why was it here
                // axios.get('/beatmaps/relevantInfo').then(response => {
                //     this.$parent.allBeatmaps = response.data.beatmaps;
                //     this.$parent.beatmaps = response.data.beatmaps;
                //     if (this.$parent.filterValue.length > 2) {
                //         this.$parent.filter();
                //     }
                // });
            }
        },
    }
}
</script>

<style>

</style>