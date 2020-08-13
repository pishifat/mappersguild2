<template>
    <div class="my-2 col-sm-12 col-md-6 col-lg-4" @click="setSelectedBeatmap(beatmap)">
        <div
            class="card map-card bg-dark"
            :class="statusBorder"
            data-toggle="modal"
            data-target="#editBeatmap"
        >
            <img
                class="card-img"
                :src="processUrl(beatmap.url)"
                style="opacity: 0.2;"
                @error="fallbackImage($event)"
            >
            <div class="card-img-overlay" style="padding: 0.50rem 0.50rem 0 0.50rem">
                <p
                    class="card-title mb-1"
                >
                    {{ formatMetadata(beatmap.song.artist, beatmap.song.title) }}
                </p>
                <small class="card-text">
                    <img
                        v-if="beatmap.quest && beatmap.quest.art"
                        class="rounded-circle mr-1"
                        style="height:24px; width: 24px;"
                        :src="beatmap.quest.isMbc ? '../../images/mbc-icon.png' :
                            beatmap.quest.art ? 'https://assets.ppy.sh/artists/' + beatmap.quest.art + '/cover.jpg' :
                            '../../images/fa_icon.png'"
                        data-toggle="tooltip"
                        :title="beatmap.quest.name"
                    >
                    Hosted by
                    <a
                        :href="'https://osu.ppy.sh/users/' + beatmap.host.osuId"
                        target="_blank"
                        @click.stop
                    >{{ beatmap.host.username }}</a>
                    <i v-if="beatmap.mode == 'taiko'" class="fas fa-drum" />
                    <i v-else-if="beatmap.mode == 'catch'" class="fas fa-apple-alt" />
                    <i v-else-if="beatmap.mode == 'mania'" class="fas fa-stream" />
                    <span
                        class="font-weight-bold float-right pt-1"
                        v-html="processDiffs(beatmap.tasks, beatmap.tasksLocked, beatmap.mode)"
                    />
                </small>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapMutations } from 'vuex';
import { Beatmap } from '../../../interfaces/beatmap/beatmap';

export default Vue.extend({
    name: 'BeatmapCard',
    props: {
        beatmap: {
            type: Object as () => Beatmap,
            required: true,
        },
    },
    data () {
        return {
            defaultUrl: 'https://osu.ppy.sh/images/layout/beatmaps/default-bg.png',
        };
    },
    computed: {
        statusBorder(): string {
            if (this.beatmap.status) {
                return 'card-status-' + this.beatmap.status.toLowerCase();
            }

            return '';
        },
    },
    methods: {
        ...mapMutations([
            'setSelectedBeatmap',
        ]),
        fallbackImage(e): void {
            e.target.src = this.defaultUrl;
        },
        formatMetadata(artist, title): string {
            const str = artist + ' - ' + title;

            if (str.length > 34) {
                return str.slice(0, 34) + '...';
            } else {
                return str;
            }
        },
        processUrl(beatmapUrl): string {
            if (beatmapUrl && beatmapUrl.indexOf('osu.ppy.sh/beatmapsets/') !== -1) {
                const indexStart = beatmapUrl.indexOf('beatmapsets/') + 'beatmapsets/'.length;
                const indexEnd = beatmapUrl.indexOf('#');
                let idUrl;

                if (indexEnd !== -1) {
                    idUrl = beatmapUrl.slice(indexStart, indexEnd);
                } else {
                    idUrl = beatmapUrl.slice(indexStart);
                }

                return `https://assets.ppy.sh/beatmaps/${idUrl}/covers/card.jpg`;
            } else {
                return this.defaultUrl;
            }
        },
        processDiffs(tasks, tasksLocked, mode): string {
            let diffsBlock = '';

            tasks.forEach(task => {
                if (task.name == 'Storyboard') {
                    diffsBlock += `<span class="px-1 ${task.status.toLowerCase()}">SB</span>`;
                }
            });

            if (mode == 'hybrid') {
                const modes = [
                    { name: 'osu', short: '<i class="far fa-circle"></i>', count: 0 },
                    { name: 'taiko', short: '<i class="fas fa-drum"></i>', count: 0 },
                    { name: 'catch', short: '<i class="fas fa-apple-alt"></i>', count: 0 },
                    { name: 'mania', short: '<i class="fas fa-stream"></i>', count: 0 },
                ];

                modes.forEach(mode => {
                    let modeStatus = 'done';
                    tasks.forEach(task => {
                        if (mode.name == task.mode) {
                            mode.count++;

                            if (task.status == 'WIP') {
                                modeStatus = 'wip';
                            }
                        }
                    });
                    diffsBlock += `<span class="px-1 ${mode.count == 0 ? 'blocked' : modeStatus}" data-toggle="tooltip" data-placement="top" 
                        title="${mode.count > 0 ? mode.count : ''}">
                        ${mode.short}</span>`;

                });

            } else {
                const diffs = [
                    { name: 'Easy', short: 'E', count: 0 },
                    { name: 'Normal', short: 'N', count: 0 },
                    { name: 'Hard', short: 'H', count: 0 },
                    { name: 'Insane', short: 'I', count: 0 },
                    { name: 'Expert', short: 'X', count: 0 },
                ];

                if (tasks.length >= 10) {
                    let singleStatus;
                    diffs.forEach(diff => {
                        tasks.forEach(task => {
                            if (diff.name == task.name) {
                                diff.count++;
                                singleStatus = task.status.toLowerCase();
                            }
                        });

                        if (diff.count > 0) {
                            if (diff.count == 1) {
                                diffsBlock += `<span class="px-1 ${singleStatus}">${
                                    diff.short
                                }</span>`;
                            } else {
                                diffsBlock += `<span class="px-1" data-toggle="tooltip" data-placement="top" title="${
                                    diff.count
                                }">${diff.short}${diff.count > 1 ? '+' : ''}</span>`;
                            }
                        } else if (tasksLocked.indexOf(diff.name) >= 0) {
                            diffsBlock += `<span class="px-1 blocked">${diff.short}</span>`;
                        } else {
                            diffsBlock += `<span class="px-1 open">${diff.short}</span>`;
                        }
                    });
                } else {
                    diffs.forEach(diff => {
                        let isClaimed = false;
                        let isUsed = false;
                        tasks.forEach(task => {
                            if (diff.name == task.name) {
                                diffsBlock += `<span class="px-1 ${task.status.toLowerCase()}">${
                                    diff.short
                                }</span>`;

                                isClaimed = true;
                                isUsed = true;
                            }
                        });
                        tasksLocked.forEach(task => {
                            if (diff.name == task) {
                                if (!isClaimed) {
                                    diffsBlock += `<span class="px-1 blocked">${
                                        diff.short
                                    }</span>`;
                                }

                                isUsed = true;
                            }
                        });

                        if (!isUsed) {
                            diffsBlock += `<span class="px-1 open">${diff.short}</span>`;
                        }
                    });
                }
            }

            return diffsBlock;
        },
    },
});
</script>

<style>
    .map-card{
        overflow:hidden;
        height:75px;
    }

    .card-status {
        position: absolute;
        top: 0px;
        right: 0px;
        width: 0px;
        height: 0px;
        border-bottom: 15px solid transparent;
        z-index: 10000;
    }

    .card-status-wip {
        border-left: 4px solid var(--wip);
    }

    .card-status-done {
        border-left: 4px solid var(--done);
    }

    .card-status-qualified {
        border-left: 4px solid var(--guild);
    }

    .card-status-ranked {
        border-left: 4px solid var(--ranked);
    }
</style>

