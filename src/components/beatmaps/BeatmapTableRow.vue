<template>
    <div>
        <div class="card card-body card-level-2 my-1 p-1" :class="statusBorder()">
            <div class="container">
                <div class="row">
                    <div class="col-sm-6">
                        <img
                            v-if="beatmap.quest || beatmap.isShowcase"
                            class="rounded-circle mr-1 quest-icon"
                            :src="beatmap.isShowcase || !beatmap.quest.art ? '/images/no-art-icon.png' :
                                beatmap.quest.isMbc ? '/images/mbc-icon.png' :
                                'https://assets.ppy.sh/artists/' + beatmap.quest.art + '/cover.jpg'"
                            data-toggle="tooltip"
                            :title="beatmap.quest && beatmap.quest.name"
                        >
                        <a
                            href="#"
                            data-toggle="collapse"
                            :data-target="'#details' + beatmap.id"
                            @click="selectBeatmap()"
                        >
                            {{ formatMetadata() }}
                            <i class="fas fa-angle-down" />
                        </a>
                    </div>
                    <div class="col-sm-2 small d-flex justify-content-end align-items-center">
                        <process-tasks
                            :tasks="beatmap.tasks"
                            :tasks-locked="beatmap.tasksLocked"
                            :mode="beatmap.mode"
                        />
                    </div>
                    <div class="col-sm-3 small">
                        <span class="text-white-50">Hosted by</span>
                        <a :href="'https://osu.ppy.sh/users/' + beatmap.host.osuId" target="_blank" @click.stop>{{ beatmap.host.username }}</a>
                        <i v-if="beatmap.mode == 'taiko'" class="fas fa-drum text-white-50" />
                        <i v-else-if="beatmap.mode == 'catch'" class="fas fa-apple-alt text-white-50" />
                        <i v-else-if="beatmap.mode == 'mania'" class="fas fa-stream text-white-50" />
                    </div>
                    <div v-if="beatmap.url" class="col-sm-1 d-flex justify-content-end align-items-center">
                        <a :href="beatmap.url" target="_blank">
                            <i class="fas fa-link" />
                        </a>
                    </div>
                </div>
            </div>
        </div>

        <div :id="'details' + beatmap.id" class="collapse my-2 mx-4 row border-right border-left py-3" :class="'border-' + beatmap.status.toLowerCase()">
            <beatmap-info
                :beatmap="beatmap"
            />
        </div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import BeatmapInfo from './beatmapInfo/BeatmapInfo.vue';
import { Beatmap, BeatmapStatus } from '@interfaces/beatmap/beatmap';
import ProcessTasks from './ProcessTasks.vue';

export default Vue.extend({
    name: 'BeatmapTableRow',
    components: {
        BeatmapInfo,
        ProcessTasks,
    },
    props: {
        beatmap: {
            type: Object as () => Beatmap,
            required: true,
        },
    },
    methods: {
        selectBeatmap(): void {
            history.pushState(null, 'Beatmaps', `/beatmaps?id=${this.beatmap.id}`);
        },
        formatMetadata(): string {
            const str = this.beatmap.song.artist + ' - ' + this.beatmap.song.title;

            if (str.length > 70) {
                return str.slice(0, 70) + '...';
            } else {
                return str;
            }
        },
        statusBorder(): string {
            if (this.beatmap.status == BeatmapStatus.WIP) {
                return 'card-status-wip';
            } else if (this.beatmap.status == BeatmapStatus.Done) {
                return 'card-status-done';
            } else if (this.beatmap.status == BeatmapStatus.Qualified) {
                return 'card-status-qualified';
            } else if (this.beatmap.status == BeatmapStatus.Ranked) {
                return 'card-status-ranked';
            }

            return '';
        },
    },
});
</script>

<style scoped>
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

    .quest-icon {
        width: 24px;
        height: 24px;
    }
</style>

