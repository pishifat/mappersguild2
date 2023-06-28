<template>
    <div>
        <div class="row mb-2">
            <div class="col">
                <div>
                    Link
                    <a
                        id="editLink"
                        v-bs-tooltip:right="'edit link'"
                        href="#"
                        class="text-success small ms-1"
                        :class="{ 'text-danger': showLinkInput }"
                        @click.prevent="showLinkInput = !showLinkInput"
                    >
                        <i class="fas fa-edit" />
                    </a>
                </div>
                <div class="small ms-3">
                    <a
                        v-if="beatmap.url"
                        :href="beatmap.url"
                        target="_blank"
                        class="text-truncate"
                        style="display: block;"
                    >
                        {{ beatmap.url }}
                    </a>
                    <i v-else class="text-secondary">none</i>
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
                    />
                    <button
                        id="addLinkButton"
                        class="btn btn-outline-info"
                        type="submit"
                        @click="saveLink($event)"
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
import { Beatmap } from '../../../../interfaces/beatmap/beatmap';

export default defineComponent({
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
            const bm = await this.$http.executePost<Beatmap>(`/beatmaps/${this.beatmap.id}/setLink`, { url: this.url }, e);

            if (!this.$http.isError(bm)) {
                this.showLinkInput = false;
                this.$store.dispatch('beatmaps/updateBeatmap', bm);
            }
        },
    },
});
</script>
