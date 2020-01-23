<template>
    <div>
        <div class="card min-spacing static-card" :class="statusBorder()">
            <div class="card-header min-spacing row d-flex align-items-center my-2">
                <div class="col-sm-6">
                    <img
                        v-if="beatmap.quest && beatmap.quest.art"
                        class="rounded-circle mr-1"
                        style="height:24px; width: 24px;"
                        :src="beatmap.quest.art ? 'https://assets.ppy.sh/artists/' + beatmap.quest.art + '/cover.jpg' : '../../images/fa_icon.png'"
                        data-toggle="tooltip"
                        :title="beatmap.quest.name"
                    >
                    <a href="#" data-toggle="collapse" :data-target="'#details' + beatmap.id">
                        {{ formatMetadata() }}
                        <i class="fas fa-angle-down" />
                    </a>
                </div>
                <div class="col-sm-2 small d-flex justify-content-end">
                    <span
                        class="font-weight-bold"
                        v-html="processDiffs(beatmap.tasks, beatmap.tasksLocked, beatmap.mode)"
                    />
                </div>
                <div class="col-sm-3 small">
                    <span class="text-white-50">Hosted by</span>
                    <a :href="'https://osu.ppy.sh/users/' + beatmap.host.osuId" target="_blank" @click.stop>{{ beatmap.host.username }}</a>
                </div>
                <div v-if="beatmap.url" class="col-sm-1 d-flex justify-content-end">
                    <a :href="beatmap.url" target="_blank">
                        <i class="fas fa-link" />
                    </a>
                </div>
            </div>
        </div>

        <div :id="'details' + beatmap.id" class="collapse my-2 mx-5 row border-right border-left border-secondary bg-darker py-3">
            <beatmap-info
                :beatmap="beatmap"
            />
        </div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapState } from 'vuex';
import BeatmapInfo from './beatmapInfo/BeatmapInfo.vue';
import { Beatmap } from '@srcModels/beatmap';

export default Vue.extend({
    name: 'BeatmapTableRow',
    components: {
        BeatmapInfo,
    },
    props: {
        beatmap: {
            type: Object as () => Beatmap,
            required: true,
        },
    },
    computed: mapState([
        'userOsuId',
    ]),
    methods: {
        formatMetadata(): string {
            const str = this.beatmap.song.artist + ' - ' + this.beatmap.song.title;

            if (str.length > 70) {
                return str.slice(0, 70) + '...';
            } else {
                return str;
            }
        },
        statusBorder(): string {
            if (this.beatmap.status == 'WIP') {
                return 'card-status-wip';
            } else if (this.beatmap.status == 'Done') {
                return 'card-status-done';
            } else if (this.beatmap.status == 'Qualified') {
                return 'card-status-qualified';
            } else if (this.beatmap.status == 'Ranked') {
                return 'card-status-ranked';
            }

            return '';
        },
        processDiffs(tasks, tasksLocked, mode): string {
            let diffsBlock = '';

            tasks.forEach(task => {
                if (task.name == 'Storyboard') {
                    diffsBlock += `<span class="px-1 text-shadow ${task.status.toLowerCase()}">SB</span>`;
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
                    diffsBlock += `<span class="px-1 text-shadow ${mode.count == 0 ? 'blocked' : modeStatus}" data-toggle="tooltip" data-placement="top" 
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
                                diffsBlock += `<span class="px-1 text-shadow ${singleStatus}">${
                                    diff.short
                                }</span>`;
                            } else {
                                diffsBlock += `<span class="px-1 text-shadow" data-toggle="tooltip" data-placement="top" title="${
                                    diff.count
                                }">${diff.short}${diff.count > 1 ? '+' : ''}</span>`;
                            }
                        } else if (tasksLocked.indexOf(diff.name) >= 0) {
                            diffsBlock += `<span class="px-1 text-shadow blocked">${diff.short}</span>`;
                        } else {
                            diffsBlock += `<span class="px-1 text-shadow open">${diff.short}</span>`;
                        }
                    });
                } else {
                    diffs.forEach(diff => {
                        let isClaimed = false;
                        let isUsed = false;
                        tasks.forEach(task => {
                            if (diff.name == task.name) {
                                diffsBlock += `<span class="px-1 text-shadow ${task.status.toLowerCase()}">${
                                    diff.short
                                }</span>`;

                                isClaimed = true;
                                isUsed = true;
                            }
                        });
                        tasksLocked.forEach(task => {
                            if (diff.name == task) {
                                if (!isClaimed) {
                                    diffsBlock += `<span class="px-1 text-shadow blocked">${
                                        diff.short
                                    }</span>`;
                                }

                                isUsed = true;
                            }
                        });

                        if (!isUsed) {
                            diffsBlock += `<span class="px-1 text-shadow open">${diff.short}</span>`;
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

    tr td{ /*FROM HERE*/
        padding: 5px 5px 5px 5px !important;
        margin: 0 !important;
    }
</style>

