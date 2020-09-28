<template>
    <div id="mode" class="form-group">
        <div class="d-inline-block mr-2">
            Mode
        </div>
        <button
            class="btn btn-sm rounded-100"
            :class="beatmap.mode == 'osu' ? 'btn-info' : 'btn-outline-info'"
            :disabled="beatmap.mode == 'osu'"
            data-toggle="tooltip"
            data-placement="top"
            title="osu!"
            @click="setMode(beatmap.id, 'osu', $event)"
        >
            <i class="far fa-circle" />
        </button>
        <button
            class="btn btn-sm rounded-100"
            :class="beatmap.mode == 'taiko' ? 'btn-info' : 'btn-outline-info'"
            :disabled="beatmap.mode == 'taiko'"
            data-toggle="tooltip"
            data-placement="top"
            title="osu!taiko"
            @click="setMode(beatmap.id, 'taiko', $event)"
        >
            <i class="fas fa-drum" />
        </button>
        <button
            class="btn btn-sm rounded-100"
            :class="beatmap.mode == 'catch' ? 'btn-info' : 'btn-outline-info'"
            :disabled="beatmap.mode == 'catch'"
            data-toggle="tooltip"
            data-placement="top"
            title="osu!catch"
            @click="setMode(beatmap.id, 'catch', $event)"
        >
            <i class="fas fa-apple-alt" />
        </button>
        <button
            class="btn btn-sm rounded-100"
            :class="beatmap.mode == 'mania' ? 'btn-info' : 'btn-outline-info'"
            :disabled="beatmap.mode == 'mania'"
            data-toggle="tooltip"
            data-placement="top"
            title="osu!mania"
            @click="setMode(beatmap.id, 'mania', $event)"
        >
            <i class="fas fa-stream" />
        </button>
        <button
            class="btn btn-sm rounded-100"
            :class="beatmap.mode == 'hybrid' ? 'btn-info' : 'btn-outline-info'"
            :disabled="beatmap.mode == 'hybrid'"
            data-toggle="tooltip"
            data-placement="top"
            title="multiple modes"
            @click="setMode(beatmap.id, 'hybrid', $event)"
        >
            <i class="fas fa-check-double" />
        </button>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { Beatmap } from '../../../../interfaces/beatmap/beatmap';

export default Vue.extend({
    name: 'ModeChoice',
    props: {
        beatmap: {
            type: Object as () => Beatmap,
            required: true,
        },
    },
    methods: {
        async setMode(id: Beatmap['id'], mode, e): Promise<void> {
            const beatmap = await this.executePost<Beatmap>(`/beatmaps/${id}/setMode`, { mode }, e);

            if (!this.isError(beatmap)) {
                this.$store.dispatch('updateBeatmap', beatmap);
            }
        },
    },
});
</script>
