<template>
    <modal-dialog
        id="editBeatmap"
        :loaded="Boolean(selectedBeatmap)"
        :header-class="selectedBeatmap ? 'bg-' + selectedBeatmap.status.toLowerCase() : ''"
    >
        <template #header class="d-flex align-items-center">
            <quest-img :beatmap="selectedBeatmap" />

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

            <user-link class="mx-1" :user="selectedBeatmap.host" />

            <modes-icons :modes="[selectedBeatmap.mode]" />
        </template>

        <template #default>
            <beatmap-info
                :beatmap="selectedBeatmap"
            />
        </template>
    </modal-dialog>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import BeatmapInfo from '@components/beatmaps/beatmapInfo/BeatmapInfo.vue';
import ModalDialog from '@components/ModalDialog.vue';
import { Beatmap, BeatmapStatus } from '@interfaces/beatmap/beatmap';
import QuestImg from '@components/beatmaps/QuestImg.vue';
import ModesIcons from '@components/ModesIcons.vue';

export default defineComponent({
    components: {
        BeatmapInfo,
        ModalDialog,
        QuestImg,
        ModesIcons,
    },
    props: {
        selectedBeatmap: {
            type: Object as PropType<Beatmap>,
            default: () => ({}),
        },
    },
    watch: {
        selectedBeatmap(): void {
            if (this.selectedBeatmap && this.$route.query.id !== this.selectedBeatmap.id) {
                this.$router.replace(`/${this.selectedBeatmap.status === BeatmapStatus.Secret ? 'showcase' : 'beatmaps'}?id=${this.selectedBeatmap.id}`);
            }
        },
    },
});
</script>