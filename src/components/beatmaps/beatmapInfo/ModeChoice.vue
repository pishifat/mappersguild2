<template>
    <div id="mode" class="mb-3">
        <div class="d-inline-block me-2">
            Mode
        </div>
        <button
            v-bs-tooltip="'osu!'"
            class="btn btn-sm rounded-100"
            :class="beatmap.mode == 'osu' ? 'btn-info' : 'btn-outline-info'"
            :disabled="beatmap.mode == 'osu'"
            @click="setMode(beatmap.id, 'osu', $event)"
        >
            <i class="far fa-circle" />
        </button>
        <button
            v-bs-tooltip="'osu!taiko'"
            class="btn btn-sm rounded-100"
            :class="beatmap.mode == 'taiko' ? 'btn-info' : 'btn-outline-info'"
            :disabled="beatmap.mode == 'taiko'"
            @click="setMode(beatmap.id, 'taiko', $event)"
        >
            <i class="fas fa-drum" />
        </button>
        <button
            v-bs-tooltip="'osu!catch'"
            class="btn btn-sm rounded-100"
            :class="beatmap.mode == 'catch' ? 'btn-info' : 'btn-outline-info'"
            :disabled="beatmap.mode == 'catch'"
            @click="setMode(beatmap.id, 'catch', $event)"
        >
            <i class="fas fa-apple-alt" />
        </button>
        <button
            v-bs-tooltip="'osu!mania'"
            class="btn btn-sm rounded-100"
            :class="beatmap.mode == 'mania' ? 'btn-info' : 'btn-outline-info'"
            :disabled="beatmap.mode == 'mania'"
            @click="setMode(beatmap.id, 'mania', $event)"
        >
            <i class="fas fa-stream" />
        </button>
        <button
            v-bs-tooltip="'multiple modes'"
            class="btn btn-sm rounded-100"
            :class="beatmap.mode == 'hybrid' ? 'btn-info' : 'btn-outline-info'"
            :disabled="beatmap.mode == 'hybrid'"
            @click="setMode(beatmap.id, 'hybrid', $event)"
        >
            <i class="fas fa-check-double" />
        </button>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { Beatmap } from '../../../../interfaces/beatmap/beatmap';

export default defineComponent({
    name: 'ModeChoice',
    props: {
        beatmap: {
            type: Object as () => Beatmap,
            required: true,
        },
    },
    methods: {
        async setMode(id: Beatmap['id'], mode, e): Promise<void> {
            const beatmap = await this.$http.executePost<Beatmap>(`/beatmaps/${id}/setMode`, { mode }, e);

            if (!this.$http.isError(beatmap)) {
                this.$store.dispatch('beatmaps/updateBeatmap', beatmap);
            }
        },
    },
});
</script>

<style scoped>

.rounded-100 {
    border-radius: 100%!important;
}

</style>
