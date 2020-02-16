<template>
    <div>
        <div class="container bg-container py-1">
            <div class="row">
                <div class="col-sm">
                    <data-table
                        #default="{ obj: beatmap }"
                        :data="beatmaps"
                        :headers="['METADATA', 'PACK ID', 'STATUS']"
                        @update:selected-id="selectedBeatmapId = $event"
                    >
                        <td class="text-truncate">
                            <i v-if="beatmap.mode == 'osu'" class="fas fa-circle" />
                            <i v-else-if="beatmap.mode == 'taiko'" class="fas fa-drum" />
                            <i v-else-if="beatmap.mode == 'catch'" class="fas fa-apple-alt" />
                            <i v-else-if="beatmap.mode == 'mania'" class="fas fa-stream" />
                            <a v-if="beatmap.url" :href="beatmap.url">
                                {{ beatmap.song | formatMetadata }}
                            </a>
                            <span v-else>{{ beatmap.song | formatMetadata }}</span>
                        </td>
                        <td>
                            {{ beatmap.packId }}
                        </td>
                        <td>
                            {{ beatmap.status }}
                        </td>
                    </data-table>
                </div>
            </div>
        </div>

        <beatmap-info
            :beatmap="selectedBeatmap"
            @update-beatmap="updateBeatmap($event)"
        />
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import BeatmapInfo from '../../components/admin/BeatmapInfo.vue';
import DataTable from '../../components/admin/DataTable.vue';
import { Beatmap } from '../../../interfaces/beatmap/beatmap';

export default Vue.extend({
    components: {
        DataTable,
        BeatmapInfo,
    },
    filters: {
        formatMetadata(song): string {
            if (!song) {
                return '';
            }

            let metadata = song.artist + ' - ';

            if (song.title.length > 40) {
                metadata += song.title.slice(0,40) + '...';
            } else {
                metadata += song.title;
            }

            return metadata;
        },
    },
    data () {
        return {
            beatmaps: [] as Beatmap[],
            selectedBeatmapId: '',
        };
    },
    computed: {
        selectedBeatmap(): undefined | Beatmap {
            return this.beatmaps.find(b => b.id === this.selectedBeatmapId);
        },
    },
    async created() {
        const beatmaps = await this.executeGet<Beatmap[]>('/admin/beatmaps/load');

        if (!this.isError(beatmaps)) {
            this.beatmaps = beatmaps;
        }

        $('#loading').fadeOut();
        $('#app')
            .attr('style', 'visibility: visible')
            .hide()
            .fadeIn();
    },
    methods: {
        updateBeatmap(b): void {
            const i = this.beatmaps.findIndex(beatmap => beatmap.id == b.id);

            if (i !== -1) {
                Vue.set(this.beatmaps, i, b);
            }
        },
    },
});
</script>
