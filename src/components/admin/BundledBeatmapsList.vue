<template>
    <div class="container card card-body py-3 mt-2">
        <h5>Bundled beatmap list generator</h5>
        <button class="btn btn-sm w-100 btn-info" @click="findBundledBeatmaps($event)">
            Load beatmaps with ENHI+ spreads
        </button>
        <div v-if="bundledBeatmaps.length" class="row mt-3 small">
            <div class="col-sm-6">
                osu ({{ osuBeatmaps.length }})
                <copy-paste :distinct="'osu'">
                    <div v-for="beatmap in osuBeatmaps" :key="beatmap.id">
                        <a href="#" class="me-1" @click.stop.prevent="toggleIsBundled(beatmap.id, beatmap.isBundled)">
                            <i class="fas" :class="beatmap.isBundled ? 'text-done fa-check' : 'text-danger fa-times'" />
                        </a>
                        <a :href="beatmap.url" target="_blank">{{ beatmap.song.artist + ' - ' + beatmap.song.title }} ({{ findOsuId(beatmap.url) }})</a>
                    </div>
                </copy-paste>
            </div>
            <div class="col-sm-6">
                taiko ({{ taikoBeatmaps.length }})
                <copy-paste :distinct="'taiko'">
                    <div v-for="beatmap in taikoBeatmaps" :key="beatmap.id">
                        <a href="#" class="me-1" @click.stop.prevent="toggleIsBundled(beatmap.id, beatmap.isBundled)">
                            <i class="fas" :class="beatmap.isBundled ? 'text-done fa-check' : 'text-danger fa-times'" />
                        </a>
                        <a :href="beatmap.url" target="_blank">{{ beatmap.song.artist + ' - ' + beatmap.song.title }} ({{ findOsuId(beatmap.url) }})</a>
                    </div>
                </copy-paste>
            </div>
            <div class="col-sm-6">
                catch ({{ catchBeatmaps.length }})
                <copy-paste :distinct="'catch'">
                    <div v-for="beatmap in catchBeatmaps" :key="beatmap.id">
                        <a href="#" class="me-1" @click.stop.prevent="toggleIsBundled(beatmap.id, beatmap.isBundled)">
                            <i class="fas" :class="beatmap.isBundled ? 'text-done fa-check' : 'text-danger fa-times'" />
                        </a>
                        <a :href="beatmap.url" target="_blank">{{ beatmap.song.artist + ' - ' + beatmap.song.title }} ({{ findOsuId(beatmap.url) }})</a>
                    </div>
                </copy-paste>
            </div>
            <div class="col-sm-6">
                mania ({{ maniaBeatmaps.length }})
                <copy-paste :distinct="'mania'">
                    <div v-for="beatmap in maniaBeatmaps" :key="beatmap.id">
                        <a href="#" class="me-1" @click.stop.prevent="toggleIsBundled(beatmap.id, beatmap.isBundled)">
                            <i class="fas" :class="beatmap.isBundled ? 'text-done fa-check' : 'text-danger fa-times'" />
                        </a>
                        <a :href="beatmap.url" target="_blank">{{ beatmap.song.artist + ' - ' + beatmap.song.title }} ({{ findOsuId(beatmap.url) }})</a>
                    </div>
                </copy-paste>
            </div>
            <p>final lists</p>
            <div class="row">
                <div class="col-sm-3">
                    osu ({{ osuFinalBeatmaps.length }})
                    <copy-paste :distinct="'osufinal'">
                        <div v-for="beatmap in osuFinalBeatmaps" :key="beatmap.id">
                            <a :href="beatmap.url" target="_blank" class="me-1">{{ findOsuId(beatmap.url) }}</a>
                            <a href="#" @click.stop.prevent="toggleIsBundled(beatmap.id, beatmap.isBundled)">
                                <i class="fas" :class="beatmap.isBundled ? 'text-done fa-check' : 'text-danger fa-times'" />
                            </a>
                        </div>
                    </copy-paste>
                </div>
                <div class="col-sm-3">
                    taiko ({{ taikoFinalBeatmaps.length }})
                    <copy-paste :distinct="'taiko'">
                        <div v-for="beatmap in taikoFinalBeatmaps" :key="beatmap.id">
                            <a :href="beatmap.url" target="_blank" class="me-1">{{ findOsuId(beatmap.url) }}</a>
                            <a href="#" @click.stop.prevent="toggleIsBundled(beatmap.id, beatmap.isBundled)">
                                <i class="fas" :class="beatmap.isBundled ? 'text-done fa-check' : 'text-danger fa-times'" />
                            </a>
                        </div>
                    </copy-paste>
                </div>
                <div class="col-sm-3">
                    catch ({{ catchFinalBeatmaps.length }})
                    <copy-paste :distinct="'catch'">
                        <div v-for="beatmap in catchFinalBeatmaps" :key="beatmap.id">
                            <a :href="beatmap.url" target="_blank" class="me-1">{{ findOsuId(beatmap.url) }}</a>
                            <a href="#" @click.stop.prevent="toggleIsBundled(beatmap.id, beatmap.isBundled)">
                                <i class="fas" :class="beatmap.isBundled ? 'text-done fa-check' : 'text-danger fa-times'" />
                            </a>
                        </div>
                    </copy-paste>
                </div>
                <div class="col-sm-3">
                    mania ({{ maniaFinalBeatmaps.length }})
                    <copy-paste :distinct="'mania'">
                        <div v-for="beatmap in maniaFinalBeatmaps" :key="beatmap.id">
                            <a :href="beatmap.url" target="_blank" class="me-1">{{ findOsuId(beatmap.url) }}</a>
                            <a href="#" @click.stop.prevent="toggleIsBundled(beatmap.id, beatmap.isBundled)">
                                <i class="fas" :class="beatmap.isBundled ? 'text-done fa-check' : 'text-danger fa-times'" />
                            </a>
                        </div>
                    </copy-paste>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { Beatmap } from '../../../interfaces/beatmap/beatmap';
import CopyPaste from '../CopyPaste.vue';

export default defineComponent({
    name: 'BundledBeatmapsList',
    components: {
        CopyPaste,
    },
    data() {
        return {
            bundledBeatmaps: [] as any[],
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
        osuFinalBeatmaps(): Beatmap[] {
            return this.bundledBeatmaps.filter(b => b.mode == 'osu' && b.isBundled);
        },
        taikoFinalBeatmaps(): Beatmap[] {
            return this.bundledBeatmaps.filter(b => b.mode == 'taiko' && b.isBundled);
        },
        catchFinalBeatmaps(): Beatmap[] {
            return this.bundledBeatmaps.filter(b => b.mode == 'catch' && b.isBundled);
        },
        maniaFinalBeatmaps(): Beatmap[] {
            return this.bundledBeatmaps.filter(b => b.mode == 'mania' && b.isBundled);
        },
    },
    methods: {
        async findBundledBeatmaps(e): Promise<void> {
            const res: any = await this.$http.executeGet('/admin/beatmaps/findBundledBeatmaps', e);

            if (res && !res.error) {
                this.bundledBeatmaps = res;
            }
        },
        async toggleIsBundled (id: string, isBundled: boolean): Promise<void> {
            const newBeatmap = await this.$http.executePost<{ id }>('/admin/beatmaps/' + id + '/toggleIsBundled', {
                isBundled,
            });

            if (!this.$http.isError(newBeatmap)) {
                const newBundledBeatmaps: any = [...this.bundledBeatmaps];

                const i = newBundledBeatmaps.findIndex(b => b.id == id);

                newBundledBeatmaps[i] = newBeatmap;

                this.bundledBeatmaps = newBundledBeatmaps;
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
