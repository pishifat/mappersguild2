<template>
    <div id="mode">
        <div class="row mb-2">
            <div class="col">
                <div>
                    Mode
                    <a
                        id="editMode"
                        v-bs-tooltip:right="'edit mode'"
                        href="#"
                        :class="showInput ? 'text-danger' : ''"
                        class="text-success small ms-1"
                        @click.prevent="showInput = !showInput"
                    >
                        <i class="fas fa-edit" />
                    </a>
                </div>
                <div class="small ms-3 text-secondary">
                    {{ beatmap.mode == 'hybrid' ? 'Multiple modes' : beatmap.mode == 'osu' ? 'osu!' : 'osu!' + beatmap.mode }}
                </div>
            </div>
        </div>

        <div
            v-if="showInput"
            class="row mb-2"
        >
            <div class="col">
                <div class="input-group input-group-sm">
                    <select
                        v-model="selectedMode"
                        class="form-select"
                    >
                        <option
                            v-for="mode in modes"
                            :key="mode.value"
                            :value="mode.value"
                        >
                            {{ mode.name }}
                        </option>
                    </select>
                    <button
                        v-bs-tooltip="'link beatmap to quest'"
                        class="btn btn-outline-info"
                        @click="setMode($event)"
                    >
                        Save
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { Beatmap } from '@interfaces/beatmap/beatmap';

export default defineComponent({
    name: 'ModeChoice',
    props: {
        beatmap: {
            type: Object as () => Beatmap,
            required: true,
        },
    },
    data () {
        return {
            selectedMode: this.beatmap.mode,
            showInput: false,
            modes: [
                { value: 'osu', name: 'osu!' },
                { value: 'taiko', name: 'osu!taiko' },
                { value: 'catch', name: 'osu!catch' },
                { value: 'mania', name: 'osu!mania' },
                { value: 'hybrid', name: 'Multiple modes' },
            ],
        };
    },
    methods: {
        async setMode(e): Promise<void> {
            const beatmap = await this.$http.executePost<Beatmap>(`/beatmaps/${this.beatmap.id}/setMode`, { mode: this.selectedMode }, e);

            if (!this.$http.isError(beatmap)) {
                this.$store.dispatch('beatmaps/updateBeatmap', beatmap);
            }

            this.showInput = false;
        },
    },
});
</script>
