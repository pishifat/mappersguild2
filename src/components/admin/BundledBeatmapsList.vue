<template>
    <div class="container bg-container py-1 mb-4">
        <button class="btn btn-sm btn-block btn-outline-info" @click="findBundledBeatmaps($event)">
            Load bundled beatmaps
        </button>
        <div v-if="bundledBeatmaps.length">
            <p>osu</p>
            <div class="copy-paste">
                <span v-for="beatmap in osuBeatmaps" :key="beatmap.id">
                    <samp class="small text-white-50">
                        {{ findOsuId(beatmap.url) }}
                    </samp><br>
                </span>
            </div>

            <p>taiko</p>
            <div class="copy-paste">
                <span v-for="beatmap in taikoBeatmaps" :key="beatmap.id">
                    <samp class="small text-white-50">
                        {{ findOsuId(beatmap.url) }}
                    </samp><br>
                </span>
            </div>
            <p>catch</p>
            <div class="copy-paste">
                <span v-for="beatmap in catchBeatmaps" :key="beatmap.id">
                    <samp class="small text-white-50">
                        {{ findOsuId(beatmap.url) }}
                    </samp><br>
                </span>
            </div>
            <p>mania</p>
            <div class="copy-paste">
                <span v-for="beatmap in maniaBeatmaps" :key="beatmap.id">
                    <samp class="small text-white-50">
                        {{ findOsuId(beatmap.url) }}
                    </samp><br>
                </span>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { Beatmap } from '../../../interfaces/beatmap/beatmap';

export default Vue.extend({
    name: 'BundledBeatmapsList',
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

<style>
</style>