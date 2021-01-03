<template>
    <div class="my-2 col-sm-12 col-md-6 col-lg-4" @click="$emit('update:selectedBeatmap', beatmap)">
        <div
            class="card card-hover map-card bg-dark"
            :class="statusBorder"
            data-bs-toggle="modal"
            data-bs-target="#editBeatmap"
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
                    <quest-img :beatmap="beatmap" />

                    Hosted by
                    <user-link :user="beatmap.host" />

                    <i v-if="beatmap.mode == 'taiko'" class="fas fa-drum" />
                    <i v-else-if="beatmap.mode == 'catch'" class="fas fa-apple-alt" />
                    <i v-else-if="beatmap.mode == 'mania'" class="fas fa-stream" />
                    <process-tasks
                        class="float-end pt-1"
                        :tasks="beatmap.tasks"
                        :tasks-locked="beatmap.tasksLocked"
                        :mode="beatmap.mode"
                    />
                </small>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { Beatmap } from '@interfaces/beatmap/beatmap';
import ProcessTasks from './ProcessTasks.vue';
import QuestImg from './QuestImg.vue';

export default defineComponent({
    name: 'BeatmapCard',
    components: {
        ProcessTasks,
        QuestImg,
    },
    props: {
        beatmap: {
            type: Object as () => Beatmap,
            required: true,
        },
    },
    emits: [
        'update:selectedBeatmap',
    ],
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
    },
});
</script>

<style scoped>
    .map-card {
        overflow: hidden;
        height: 75px;
    }
</style>
