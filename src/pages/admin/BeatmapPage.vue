<template>
    <div>
        <div class="container card card-body py-3">
            <h5>Beatmaps list</h5>
            <button class="btn btn-sm btn-info w-100" @click="loadBeatmaps($event)">
                Load all beatmaps
            </button>

            <data-table
                v-if="beatmaps.length"
                v-slot="{ obj: beatmap }"
                :data="beatmaps"
                :headers="['METADATA', 'PACK ID', 'CREATOR', 'STATUS']"
                :custom-data-target="'#editBeatmap'"
                @update:selected-id="selectedBeatmapId = $event"
            >
                <td class="text-truncate">
                    <modes-icons :modes="[beatmap.mode]" />
                    <a v-if="beatmap.url" :href="beatmap.url" class="ms-1">
                        {{ formatMetadata(beatmap.song) }}
                    </a>
                    <span v-else class="ms-1">{{ formatMetadata(beatmap.song) }}</span>
                </td>
                <td>
                    {{ beatmap.packId }}
                </td>
                <td>
                    <user-link
                        v-if="beatmap.host"
                        :user="beatmap.host"
                    />
                </td>
                <td>
                    {{ beatmap.status }}
                </td>
            </data-table>
        </div>

        <beatmap-info-admin
            v-if="selectedBeatmap"
            :beatmap="selectedBeatmap"
            @update-beatmap="updateBeatmap($event)"
        />

        <osu-api-beatmap-search class="mt-2" />

        <contributor-stats />

        <bundled-beatmaps-list />

        <beatmap-id-list-generator />
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { mapState } from 'vuex';
import ContributorStats from '../../components/admin/ContributorStats.vue';
import BeatmapInfoAdmin from '../../components/admin/BeatmapInfoAdmin.vue';
import OsuApiBeatmapSearch from '../../components/admin/OsuApiBeatmapSearch.vue';
import BundledBeatmapsList from '../../components/admin/BundledBeatmapsList.vue';
import BeatmapIdListGenerator from '../../components/admin/BeatmapIdListGenerator.vue';
import DataTable from '../../components/admin/DataTable.vue';
import { Beatmap } from '../../../interfaces/beatmap/beatmap';
import beatmapsAdminModule from '@store/admin/beatmaps';
import ModesIcons from '@components/ModesIcons.vue';

export default defineComponent({
    components: {
        ContributorStats,
        DataTable,
        BeatmapInfoAdmin,
        OsuApiBeatmapSearch,
        BundledBeatmapsList,
        BeatmapIdListGenerator,
        ModesIcons,
    },
    data () {
        return {
            selectedBeatmapId: '',
        };
    },
    computed: {
        ...mapState({
            beatmaps: (state: any) => state.beatmapsAdmin.beatmaps,
        }),
        selectedBeatmap(): undefined | Beatmap {
            return this.beatmaps.find(b => b.id === this.selectedBeatmapId);
        },
    },
    beforeCreate () {
        if (!this.$store.hasModule('beatmapsAdmin')) {
            this.$store.registerModule('beatmapsAdmin', beatmapsAdminModule);
        }
    },
    unmounted () {
        if (this.$store.hasModule('beatmapsAdmin')) {
            this.$store.unregisterModule('beatmapsAdmin');
        }
    },
    methods: {
        async loadBeatmaps(e): Promise<void> {
            const beatmaps = await this.$http.executeGet<Beatmap[]>('/admin/beatmaps/load', e);

            if (!this.$http.isError(beatmaps)) {
                this.$store.commit('setBeatmaps', beatmaps);
            }
        },
        updateBeatmap(b): void {
            const i = this.beatmaps.findIndex(beatmap => beatmap.id == b.id);

            if (i !== -1) {
                this.beatmaps[i] = b;
            }
        },
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
});
</script>
