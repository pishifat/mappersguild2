<template>
    <div>
        <div class="container card card-body py-1">
            <div class="row">
                <div class="col-sm">
                    <button class="btn btn-sm btn-info w-100" data-bs-toggle="modal" data-bs-target="#newsPost">
                        Create news post
                    </button>
                    <data-table
                        v-slot="{ obj: beatmap }"
                        :data="beatmaps"
                        :headers="['METADATA', 'PACK ID', 'STATUS']"
                        :custom-data-target="'#editBeatmap'"
                        @update:selected-id="selectedBeatmapId = $event"
                    >
                        <td class="text-truncate">
                            <modes-icons :modes="[beatmap.mode]" />
                            <a v-if="beatmap.url" :href="beatmap.url">
                                {{ formatMetadata(beatmap.song) }}
                            </a>
                            <span v-else>{{ formatMetadata(beatmap.song) }}</span>
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

        <beatmap-info-admin
            v-if="selectedBeatmap"
            :beatmap="selectedBeatmap"
            @update-beatmap="updateBeatmap($event)"
        />

        <news-post />

        <bundled-beatmaps-list />

        <beatmap-pack-id-list-generator />
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { mapState } from 'vuex';
import NewsPost from '../../components/admin/newspost/NewsPost.vue';
import BeatmapInfoAdmin from '../../components/admin/BeatmapInfoAdmin.vue';
import BundledBeatmapsList from '../../components/admin/BundledBeatmapsList.vue';
import BeatmapPackIdListGenerator from '../../components/admin/BeatmapPackIdListGenerator.vue';
import DataTable from '../../components/admin/DataTable.vue';
import { Beatmap } from '../../../interfaces/beatmap/beatmap';
import beatmapsAdminModule from '@store/admin/beatmaps';
import ModesIcons from '@components/ModesIcons.vue';

export default defineComponent({
    components: {
        NewsPost,
        DataTable,
        BeatmapInfoAdmin,
        BundledBeatmapsList,
        BeatmapPackIdListGenerator,
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
    async created() {
        const beatmaps = await this.$http.initialRequest<Beatmap[]>('/admin/beatmaps/load');

        if (!this.$http.isError(beatmaps)) {
            this.$store.commit('setBeatmaps', beatmaps);
        }
    },
    methods: {
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
