<template>
    <div v-if="selectedBeatmap.status == 'WIP'" id="mode" class="form-group">
        <div class="d-inline-block mr-2">
            Mode
        </div>
        <button
            class="btn btn-sm rounded-100"
            :class="selectedBeatmap.mode == 'osu' ? 'btn-info' : 'btn-outline-info'"
            :disabled="selectedBeatmap.mode == 'osu'"
            data-toggle="tooltip"
            data-placement="top"
            title="osu!"
            @click="setMode(selectedBeatmap.id, 'osu', $event)"
        >
            <i class="far fa-circle" />
        </button>
        <button
            class="btn btn-sm rounded-100"
            :class="selectedBeatmap.mode == 'taiko' ? 'btn-info' : 'btn-outline-info'"
            :disabled="selectedBeatmap.mode == 'taiko'"
            data-toggle="tooltip"
            data-placement="top"
            title="osu!taiko"
            @click="setMode(selectedBeatmap.id, 'taiko', $event)"
        >
            <i class="fas fa-drum" />
        </button>
        <button
            class="btn btn-sm rounded-100"
            :class="selectedBeatmap.mode == 'catch' ? 'btn-info' : 'btn-outline-info'"
            :disabled="selectedBeatmap.mode == 'catch'"
            data-toggle="tooltip"
            data-placement="top"
            title="osu!catch"
            @click="setMode(selectedBeatmap.id, 'catch', $event)"
        >
            <i class="fas fa-apple-alt" />
        </button>
        <button
            class="btn btn-sm rounded-100"
            :class="selectedBeatmap.mode == 'mania' ? 'btn-info' : 'btn-outline-info'"
            :disabled="selectedBeatmap.mode == 'mania'"
            data-toggle="tooltip"
            data-placement="top"
            title="osu!mania"
            @click="setMode(selectedBeatmap.id, 'mania', $event)"
        >
            <i class="fas fa-stream" />
        </button>
        <button
            class="btn btn-sm rounded-100"
            :class="selectedBeatmap.mode == 'hybrid' ? 'btn-info' : 'btn-outline-info'"
            :disabled="selectedBeatmap.mode == 'hybrid'"
            data-toggle="tooltip"
            data-placement="top"
            title="multiple modes"
            @click="setMode(selectedBeatmap.id, 'hybrid', $event)"
        >
            <i class="fas fa-check-double" />
        </button>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapState } from 'vuex';
import { Beatmap } from '@srcModels/beatmap';

export default Vue.extend({
    name: 'ModeChoice',
    computed: {
        ...mapState([
            'selectedBeatmap',
        ]),
    },
    methods: {
        async setMode(id, mode, e): Promise<void> {
            const beatmap = await this.executePost<Beatmap>('/beatmaps/setMode/' + id, { mode }, e);

            if (this.isError(beatmap)) {
                this.$emit('update:info', beatmap.error);
            } else {
                this.$store.dispatch('updateBeatmap', beatmap);
            }
        },
    },
});
</script>
