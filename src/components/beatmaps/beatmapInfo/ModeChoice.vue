<template>
    <div id="mode" class="form-group" v-if="beatmap.status == 'WIP'">
        <div class="d-inline-block mr-2">
            Mode
        </div>
        <button
            class="btn btn-sm rounded-100"
            :class="beatmap.mode == 'osu' ? 'btn-info' : 'btn-outline-info'"
            :disabled="beatmap.mode == 'osu'"
            @click="setMode(beatmap.id, 'osu', $event)"
            data-toggle="tooltip"
            data-placement="top"
            title="osu!"
        >
            <i class="far fa-circle"></i>
        </button>
        <button
            class="btn btn-sm rounded-100"
            :class="beatmap.mode == 'taiko' ? 'btn-info' : 'btn-outline-info'"
            :disabled="beatmap.mode == 'taiko'"
            @click="setMode(beatmap.id, 'taiko', $event)"
            data-toggle="tooltip"
            data-placement="top"
            title="osu!taiko"
        >
            <i class="fas fa-drum"></i>
        </button>
        <button
            class="btn btn-sm rounded-100"
            :class="beatmap.mode == 'catch' ? 'btn-info' : 'btn-outline-info'"
            :disabled="beatmap.mode == 'catch'"
            @click="setMode(beatmap.id, 'catch', $event)"
            data-toggle="tooltip"
            data-placement="top"
            title="osu!catch"
        >
            <i class="fas fa-apple-alt"></i>
        </button>
        <button
            class="btn btn-sm rounded-100"
            :class="beatmap.mode == 'mania' ? 'btn-info' : 'btn-outline-info'"
            :disabled="beatmap.mode == 'mania'"
            @click="setMode(beatmap.id, 'mania', $event)"
            data-toggle="tooltip"
            data-placement="top"
            title="osu!mania"
        >
            <i class="fas fa-stream"></i>
        </button>
        <button
            class="btn btn-sm rounded-100"
            :class="beatmap.mode == 'hybrid' ? 'btn-info' : 'btn-outline-info'"
            :disabled="beatmap.mode == 'hybrid'"
            @click="setMode(beatmap.id, 'hybrid', $event)"
            data-toggle="tooltip"
            data-placement="top"
            title="multiple modes"
        >
            <i class="fas fa-check-double"></i>
        </button>
    </div>
</template>

<script>
import mixin from '../../../mixins.js';

export default {
    name: 'mode-choice',
    mixins: [ mixin ],
    props: {
        beatmap: Object,
    },
    methods: {
        setMode: async function(id, mode, e) {
            const beatmap = await this.executePost('/beatmaps/setMode/' + id, { mode }, e);

            if (beatmap) {
                this.$emit('update:beatmap', beatmap);
            }
        },
    },
}
</script>
