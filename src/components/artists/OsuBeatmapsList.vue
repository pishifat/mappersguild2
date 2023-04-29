<template>
    <div class="container card card-body py-1">
        <div class="row my-2">
            <div class="col">
                <div class="input-group">
                    <button
                        class="btn btn-primary"
                        href="#"
                        @click.prevent="savedFilterValue = filterValue.toLowerCase()"
                    >
                        <i class="fas fa-search" />
                    </button>
                    <input
                        v-model="filterValue"
                        class="form-control"
                        type="text"
                        maxlength="48"
                        placeholder="beatmap content..."
                        autocomplete="off"
                        @keyup.enter="savedFilterValue = filterValue.toLowerCase()"
                    />
                    <slot />
                </div>
            </div>
        </div>
        <div class="row">
            <div class="col-sm">
                <button v-if="!beatmaps.length" class="btn btn-sm w-25 btn-outline-info mb-2 me-2" @click="loadOsuBeatmaps($event)">
                    Load osu! beatmaps
                </button>
                <button v-if="!beatmaps.length" class="btn btn-sm w-25 btn-outline-danger mb-2" @click="generateFromCsv($event)">
                    Generate osu! beatmaps from CSV
                </button>
                <data-table
                    v-slot="{ obj: beatmap }"
                    :data="filteredBeatmaps"
                    :headers="['', 'SONG/MAP', 'ADMIN', 'COMMENT', 'PLAYS', 'FAVOURITES']"
                    :custom-data-target="'#editBeatmap'"
                    @update:selected-id="selectedBeatmapId = $event"
                >
                    <td
                        v-bs-tooltip="!beatmap.lastChecked ? 'not checked' : beatmap.isLicensed ? 'licensed' : 'not licensed'"
                        :class="!beatmap.lastChecked ? 'bg-warning' : beatmap.isLicensed ? 'bg-success' : 'bg-danger'"
                    />
                    <td class="text-truncate">
                        <a :href="'https://osu.ppy.sh/beatmapsets/' + beatmap.beatmapsetOsuIds[0]" target="_blank">
                            {{ beatmap.artist.length > 23 ? beatmap.artist.slice(0,20) + "..." : beatmap.artist }}
                            -
                            {{ beatmap.title.length > 23 ? beatmap.title.slice(0,20) + "..." : beatmap.title }}
                        </a>
                        <span
                            v-if="beatmap.sources.length && beatmap.sources[0].length"
                            v-bs-tooltip="beatmap.sources.length == 1 ? beatmap.sources[0] : beatmap.sources.join(', ')"
                            class="text-info"
                        >
                            (src)
                        </span>
                    </td>
                    <td>
                        {{ beatmap.administrators.length ? beatmap.administrators.join(', ') : '' }}
                    </td>
                    <td>
                        <span v-if="beatmap.comment && beatmap.comment.length < 23">
                            {{ beatmap.comment }}
                        </span>
                        <span v-else-if="beatmap.comment" v-bs-tooltip="beatmap.comment">
                            {{ beatmap.comment.slice(0,20) + '...' }}
                        </span>
                    </td>
                    <td>
                        {{ Number(beatmap.playcount).toLocaleString() }}
                    </td>
                    <td>
                        {{ Number(beatmap.favourites).toLocaleString() }}
                    </td>
                </data-table>
            </div>
        </div>

        <div v-if="beatmaps.length" class="text-center mb-2">
            <button
                class="btn btn-sm btn-primary"
                type="button"
                @click="showMore($event)"
            >
                <i class="fas fa-angle-down me-1" /> show {{ limit }} more <i class="fas fa-angle-down ms-1" />
            </button>
        </div>

        <osu-beatmap-edit
            v-if="selectedBeatmap"
            :beatmap="selectedBeatmap"
            @update:updateBeatmap="updateBeatmap($event)"
        />
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import DataTable from '../admin/DataTable.vue';
import OsuBeatmapEdit from './OsuBeatmapEdit.vue';
import { OsuBeatmap } from '../../../interfaces/osuBeatmap';

export default defineComponent({
    name: 'OsuBeatmapsList',
    components: {
        DataTable,
        OsuBeatmapEdit,
    },
    data () {
        return {
            beatmaps: [] as OsuBeatmap[],
            selectedBeatmapId: '',
            limit: 100,
            filterValue: '',
            savedFilterValue: '',
        };
    },
    computed: {
        selectedBeatmap(): undefined | OsuBeatmap {
            return this.beatmaps.find(b => b.id === this.selectedBeatmapId);
        },
        filteredBeatmaps(): OsuBeatmap[] {
            const copyBeatmaps = [...this.beatmaps];

            if (this.savedFilterValue.length) {
                return copyBeatmaps.filter(b => {
                    let mapData = `${b.artist.toLowerCase()} ${b.title.toLowerCase()}`;

                    for (const administrator of b.administrators) {
                        mapData += ' ';
                        mapData += administrator.toLowerCase();
                    }

                    return mapData.includes(this.savedFilterValue);
                });
            } else {
                return this.beatmaps;
            }
        },
    },
    methods: {
        async loadOsuBeatmaps(e): Promise<void> {
            const osuBeatmaps: any = await this.$http.executeGet(`/artists/osuBeatmaps/loadOsuBeatmaps/${this.limit}`, e);

            this.beatmaps = osuBeatmaps;
        },
        async showMore(e): Promise<void> {
            this.limit += this.limit;
            await this.loadOsuBeatmaps(e);
        },
        async generateFromCsv(e): Promise<void> {
            const result = confirm(`Are you sure? Local use only.`);

            if (result) {
                const osuBeatmaps: any = await this.$http.executePost(`/artists/osuBeatmaps/generateFromCsv`, {}, e);

                if (!osuBeatmaps.error) {
                    this.beatmaps = osuBeatmaps;
                }
            }
        },
        updateBeatmap(b): void {
            const i = this.beatmaps.findIndex(beatmap => beatmap.id == b.id);

            if (i !== -1) {
                this.beatmaps[i] = b;
            }
        },
    },
});
</script>
