<template>
    <div id="editBeatmap" class="modal fade" tabindex="-1">
        <div class="modal-dialog modal-lg">
            <div v-if="selectedBeatmap" class="modal-content bg-dark">
                <div class="modal-header text-dark" :class="'bg-' + selectedBeatmap.status.toLowerCase()">
                    <h5 class="modal-title d-flex align-items-center">
                        <img
                            v-if="selectedBeatmap.quest"
                            class="rounded-circle mr-1"
                            style="height:24px; width: 24px;"
                            :src="selectedBeatmap.quest.isMbc ? '../../images/mbc-icon.png' :
                                selectedBeatmap.quest.art ? `https://assets.ppy.sh/artists/${selectedBeatmap.quest.art}/cover.jpg` :
                                '../../images/fa_icon.png'"
                            data-toggle="tooltip"
                            :title="selectedBeatmap.quest.name"
                        >

                        <span v-if="selectedBeatmap.url">
                            <a :href="selectedBeatmap.url" class="text-dark" target="_blank">
                                <i class="fas fa-link" />
                                {{ selectedBeatmap.song.artist }} - {{ selectedBeatmap.song.title }}
                            </a>
                        </span>
                        <span v-else>
                            {{ selectedBeatmap.song.artist }} - {{ selectedBeatmap.song.title }}
                        </span>

                        <a :href="'https://osu.ppy.sh/users/' + selectedBeatmap.host.osuId" class="text-dark mx-1" target="_blank">({{ selectedBeatmap.host.username }})</a>

                        <i
                            v-if="selectedBeatmap.mode == 'taiko'"
                            class="fas fa-drum"
                            data-toggle="tooltip"
                            data-placement="top"
                            title="osu!taiko"
                        />
                        <i
                            v-else-if="selectedBeatmap.mode == 'catch'"
                            class="fas fa-apple-alt"
                            data-toggle="tooltip"
                            data-placement="top"
                            title="osu!catch"
                        />
                        <i
                            v-else-if="selectedBeatmap.mode == 'mania'"
                            class="fas fa-stream"
                            data-toggle="tooltip"
                            data-placement="top"
                            title="osu!mania"
                        />
                        <i
                            v-else-if="selectedBeatmap.mode == 'hybrid'"
                            class="fas fa-check-double"
                            data-toggle="tooltip"
                            data-placement="top"
                            title="multiple game modes"
                        />
                    </h5>
                    <button type="button" class="close" data-dismiss="modal">
                        <span>&times;</span>
                    </button>
                </div>
                <div class="modal-body" style="overflow: hidden;">
                    <img src="../../images/the_A.png" class="the-a-background">
                    <beatmap-info
                        :beatmap="selectedBeatmap"
                    />
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapState } from 'vuex';
import BeatmapInfo from '@components/beatmaps/beatmapInfo/BeatmapInfo.vue';

export default Vue.extend({
    components: {
        BeatmapInfo,
    },
    computed: mapState([
        'selectedBeatmap',
    ]),
    watch: {
        selectedBeatmap(): void {
            history.pushState(null, 'Beatmaps', `/beatmaps?id=${this.selectedBeatmap.id}`);
        },
    },
});
</script>