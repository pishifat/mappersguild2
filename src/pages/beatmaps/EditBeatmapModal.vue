<template>
    <modal-dialog
        id="editBeatmap"
        :loaded="Boolean(selectedBeatmap)"
        :header-class="selectedBeatmap ? 'bg-' + selectedBeatmap.status.toLowerCase() : ''"
    >
        <template #header class="d-flex align-items-center">
            <img
                v-if="selectedBeatmap.quest || selectedBeatmap.isShowcase"
                class="rounded-circle mr-1"
                style="height:24px; width: 24px;"
                :src="selectedBeatmap.isShowcase || !selectedBeatmap.quest.art ? '../../images/no-art-icon.png' :
                    selectedBeatmap.quest.isMbc ? '../../images/mbc-icon.png' :
                    `https://assets.ppy.sh/artists/${selectedBeatmap.quest.art}/cover.jpg`"
                data-toggle="tooltip"
                :title="selectedBeatmap.quest && selectedBeatmap.quest.name"
            >

            <a
                v-if="selectedBeatmap.url"
                :href="selectedBeatmap.url"
                target="_blank"
            >
                <i class="fas fa-link" />
                {{ selectedBeatmap.song.artist }} - {{ selectedBeatmap.song.title }}
            </a>
            <span v-else>
                {{ selectedBeatmap.song.artist }} - {{ selectedBeatmap.song.title }}
            </span>

            <a :href="'https://osu.ppy.sh/users/' + selectedBeatmap.host.osuId" class="mx-1" target="_blank">({{ selectedBeatmap.host.username }})</a>

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
        </template>

        <template #default>
            <beatmap-info
                :beatmap="selectedBeatmap"
            />
        </template>
    </modal-dialog>
</template>

<script lang="ts">
import Vue from 'vue';
import BeatmapInfo from '@components/beatmaps/beatmapInfo/BeatmapInfo.vue';
import ModalDialog from '@components/ModalDialog.vue';
import { BeatmapStatus } from '@interfaces/beatmap/beatmap';

export default Vue.extend({
    components: {
        BeatmapInfo,
        ModalDialog,
    },
    props: {
        selectedBeatmap: {
            type: Object,
            default: () => undefined,
        },
    },
    watch: {
        selectedBeatmap(): void {
            if (this.$route.query.id !== this.selectedBeatmap.id) {
                this.$router.replace(`/${this.selectedBeatmap.status === BeatmapStatus.Secret ? 'showcase' : 'beatmaps'}?id=${this.selectedBeatmap.id}`);
            }
        },
    },
});
</script>