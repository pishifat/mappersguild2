<template>
    <div>
        <div class="card card-body card-level-2 my-1 p-1" :class="statusBorder()">
            <div class="container">
                <div class="row">
                    <div class="col-sm-6">
                        <quest-img :beatmap="beatmap" />
                        <a
                            href="#"
                            data-bs-toggle="collapse"
                            :data-bs-target="'#details' + beatmap.id"
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

        <div :id="'details' + beatmap.id" class="collapse my-2 mx-4 row border-end border-start py-3" :class="'border-' + beatmap.status.toLowerCase()">
            <beatmap-info
                :beatmap="beatmap"
            />
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import BeatmapInfo from './beatmapInfo/BeatmapInfo.vue';
import { Beatmap } from '@interfaces/beatmap/beatmap';
import ProcessTasks from './ProcessTasks.vue';
import QuestImg from './QuestImg.vue';

export default defineComponent({
    name: 'BeatmapTableRow',
    components: {
        BeatmapInfo,
        ProcessTasks,
        QuestImg,
    },
    props: {
        beatmap: {
            type: Object as () => Beatmap,
            required: true,
        },
    },
    methods: {
        selectBeatmap(): void {
            if (this.$route.query.id !== this.beatmap.id) {
                this.$router.push(`/beatmaps?id=${this.beatmap.id}`);
            }
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
            if (this.beatmap.status) {
                return 'card-status-' + this.beatmap.status.toLowerCase();
            }

            return '';
        },
    },
});
</script>
