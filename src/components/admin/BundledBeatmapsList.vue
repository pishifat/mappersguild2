<template>
    <div class="container card card-body py-1 mb-4">
        <button class="btn btn-sm w-100 btn-outline-info" @click="findBundledBeatmaps($event)">
            Load bundled beatmaps
        </button>
        <div v-if="bundledBeatmaps.length">
            <p>osu</p>
            <copy-paste :distinct="'osu'">
                <div v-for="beatmap in osuBeatmaps" :key="beatmap.id">
                    {{ findOsuId(beatmap.url) }}
                </div>
            </copy-paste>

            <p>taiko</p>
            <copy-paste :distinct="'taiko'">
                <div v-for="beatmap in taikoBeatmaps" :key="beatmap.id">
                    {{ findOsuId(beatmap.url) }}
                </div>
            </copy-paste>

            <p>catch</p>
            <copy-paste :distinct="'catch'">
                <div v-for="beatmap in catchBeatmaps" :key="beatmap.id">
                    {{ findOsuId(beatmap.url) }}
                </div>
            </copy-paste>
            <p>mania</p>
            <copy-paste :distinct="'mania'">
                <div v-for="beatmap in maniaBeatmaps" :key="beatmap.id">
                    {{ findOsuId(beatmap.url) }}
                </div>
            </copy-paste>
        </div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { Beatmap } from '../../../interfaces/beatmap/beatmap';
import CopyPaste from '../CopyPaste.vue';

export default Vue.extend({
    name: 'BundledBeatmapsList',
    components: {
        CopyPaste,
    },
    data() {
        return {
            bundledBeatmaps: [] as Beatmap[],
        };
    },
    computed: {
        osuBeatmaps(): Beatmap[] {
            return this.bundledBeatmaps.filter(b => b.mode == 'osu');
        },
        taikoBeatmaps(): Beatmap[] {
            return this.bundledBeatmaps.filter(b => b.mode == 'taiko');
        },
        catchBeatmaps(): Beatmap[] {
            return this.bundledBeatmaps.filter(b => b.mode == 'catch');
        },
        maniaBeatmaps(): Beatmap[] {
            return this.bundledBeatmaps.filter(b => b.mode == 'mania');
        },
    },
    methods: {
        async findBundledBeatmaps(e): Promise<void> {
            const res: any = await this.executeGet('/admin/beatmaps/findBundledBeatmaps', e);

            if (res && !res.error) {
                this.bundledBeatmaps = res;
            }
        },
        findOsuId(url): number {
            const indexStart = url.indexOf('beatmapsets/') + 'beatmapsets/'.length;
            const indexEnd = url.indexOf('#');
            let bmId = '';

            if (indexEnd !== -1) {
                bmId = url.slice(indexStart, indexEnd);
            } else {
                bmId = url.slice(indexStart);
            }

            return parseInt(bmId, 10);
        },
    },
});
</script>
