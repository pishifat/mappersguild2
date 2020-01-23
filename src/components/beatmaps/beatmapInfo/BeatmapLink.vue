<template>
    <div>
        <div class="row mb-2">
            <div class="col">
                <div>
                    Link
                    <a
                        id="editLink"
                        href="#"
                        class="text-success small ml-1"
                        :class="{ 'text-danger': showLinkInput }"
                        data-toggle="tooltip"
                        data-placement="right"
                        title="edit link"
                        @click.prevent="showLinkInput = !showLinkInput"
                    >
                        <i class="fas fa-edit" />
                    </a>
                </div>
                <div class="small ml-3">
                    <a v-if="beatmap.url" :href="beatmap.url" target="_blank">
                        {{ beatmap.url }}
                    </a>
                    <i v-else class="text-white-50">none</i>
                </div>
            </div>
        </div>
        <div
            v-if="showLinkInput"
            class="row mb-2"
        >
            <div class="col-sm-12">
                <div class="input-group input-group-sm">
                    <input
                        v-model="url"
                        class="form-control form-control-sm"
                        type="text"
                        placeholder="URL"
                        @keyup.enter="saveLink($event)"
                    >
                    <div class="input-group-append">
                        <button
                            id="addLinkButton"
                            class="btn btn-outline-info"
                            type="submit"
                            data-toggle="tooltip"
                            data-placement="right"
                            title="use new osu!web link for card image"
                            @click="saveLink($event)"
                        >
                            Save
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { Beatmap } from '@models/beatmap';

export default Vue.extend({
    name: 'BeatmapLink',
    props: {
        beatmap: {
            type: Object as () => Beatmap,
            required: true,
        },
    },
    data () {
        return {
            url: '',
            showLinkInput: false,
        };
    },
    watch: {
        beatmap (b: Beatmap): void {
            if (b) {
                this.showLinkInput = false;
                this.url = b.url;
            }
        },
    },
    created () {
        this.url = this.beatmap.url;
    },
    methods: {
        async saveLink(e): Promise<void> {
            const bm = await this.executePost<Beatmap>(`/beatmaps/${this.beatmap.id}/setLink`, { url: this.url }, e);

            if (!this.isError(bm)) {
                this.showLinkInput = false;
                this.$store.dispatch('updateBeatmap', bm);
            }
        },
    },
});
</script>
