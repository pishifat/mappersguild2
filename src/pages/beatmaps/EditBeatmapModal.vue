<template>
    <modal-dialog
        id="editBeatmap"
        :loaded="Boolean(selectedBeatmap)"
        :header-style="{
            background: `linear-gradient(0deg, ${beatmapStatusColor} -250%, rgba(0, 0, 0, 0.65) 130%), ${beatmapBackgroundUrl} center no-repeat`,
            borderBottom: `4px solid ${beatmapStatusColor}`,
            backgroundSize: 'cover',
            objectFit: 'fill',
            height: '85px',
        }"
    >
        <template #header class="d-flex flex-row align-items-center gap-3">
            <quest-img :beatmap="selectedBeatmap" :big-icon="true" />

            <span class="text-white mx-3">
                <a
                    v-if="selectedBeatmap.url"
                    class="text-white"
                    :href="selectedBeatmap.url"
                    target="_blank"
                >
                    <i class="fas fa-link" />
                    {{ selectedBeatmap.song.artist }} - {{ selectedBeatmap.song.title }}
                </a>
                <span v-else>
                    {{ selectedBeatmap.song.artist }} - {{ selectedBeatmap.song.title }}
                </span>

                |<user-link class="mx-1 text-white" :user="selectedBeatmap.host" />

                <modes-icons
                    :modes="[selectedBeatmap.mode]"
                    color="white"
                />
            </span>
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
import { Beatmap } from '@interfaces/beatmap/beatmap';
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
            default: null,
        },
    },
    computed: {
        beatmapStatusColor() {
            if (this.selectedBeatmap)
                return this.selectedBeatmap.status ? (`var(--beatmap-${this.selectedBeatmap.status.toLowerCase()})`) : 'var(--beatmap-secret)';

            return 'var(--beatmap-secret)';
        },
        beatmapBackgroundUrl() {
            const beatmapUrl = this.selectedBeatmap?.url || '';

            if (beatmapUrl && beatmapUrl.indexOf('osu.ppy.sh/beatmapsets/') !== -1) {
                const indexStart = beatmapUrl.indexOf('beatmapsets/') + 'beatmapsets/'.length;
                const indexEnd = beatmapUrl.indexOf('#');
                let idUrl: string;

                if (indexEnd !== -1) {
                    idUrl = beatmapUrl.slice(indexStart, indexEnd);
                } else {
                    idUrl = beatmapUrl.slice(indexStart);
                }

                return `url(https://assets.ppy.sh/beatmaps/${idUrl}/covers/cover.jpg)`;
            } else {
                return 'url(https://osu.ppy.sh/images/layout/beatmaps/default-bg.png)';
            }
        },
    },
    watch: {
        selectedBeatmap(): void {
            if (this.selectedBeatmap && this.$route.query.id !== this.selectedBeatmap.id && this.$route.path.includes('beatmaps')) {
                this.$router.replace(`/beatmaps?id=${this.selectedBeatmap.id}`);
            }
        },
    },
});
</script>