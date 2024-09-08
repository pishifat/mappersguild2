<template>
    <div>
        <div class="container card card-body py-3">
            <h5>Featured Artists list</h5>
            <button class="btn btn-sm btn-info w-100" @click="loadRelevantFeaturedArtists($event)">
                Load (relevant) Featured Artists
            </button>
            <button class="btn btn-sm btn-info w-100 mt-2" @click="loadAllFeaturedArtists($event)">
                Load (all) Featured Artists
            </button>
            <data-table
                v-if="featuredArtists.length"
                class="mt-2"
                v-slot="{ obj: featuredArtist }"
                :data="featuredArtists"
                :headers="['ARTIST']"
                :custom-data-target="'#editFeaturedArtist'"
                @update:selected-id="selectedFeaturedArtistId = $event"
            >
                <td>
                    <a
                        v-if="featuredArtist.osuId"
                        :href="'https://osu.ppy.sh/beatmaps/artists/' + featuredArtist.osuId"
                        target="_blank"
                    >
                        {{ featuredArtist.label }}
                    </a>

                    <span v-else>{{ featuredArtist.label }}</span>
                </td>
            </data-table>
        </div>

        <recent-licensed-songs />

        <artist-ranked-maps />

        <featured-artist-info
            :featured-artist="selectedFeaturedArtist"
        />
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { mapState } from 'vuex';
import FeaturedArtistInfo from '../../components/admin/FeaturedArtistInfo.vue';
import RecentLicensedSongs from '../../components/admin/RecentLicensedSongs.vue';
import ArtistRankedMaps from '../../components/admin/ArtistRankedMaps.vue';
import DataTable from '../../components/admin/DataTable.vue';
import { FeaturedArtist } from '../../../interfaces/featuredArtist';
import artistsAdminModule from '@store/admin/featuredArtists';

export default defineComponent({
    components: {
        DataTable,
        FeaturedArtistInfo,
        RecentLicensedSongs,
        ArtistRankedMaps,
    },
    data () {
        return {
            selectedFeaturedArtistId: '',
        };
    },
    computed: {
        ...mapState({
            featuredArtists: (state: any) => state.artistsAdmin.featuredArtists,
        }),
        selectedFeaturedArtist(): undefined | FeaturedArtist {
            return this.featuredArtists.find(fa => fa.id === this.selectedFeaturedArtistId);
        },
    },
    beforeCreate () {
        if (!this.$store.hasModule('artistsAdmin')) {
            this.$store.registerModule('artistsAdmin', artistsAdminModule);
        }
    },
    unmounted () {
        if (this.$store.hasModule('artistsAdmin')) {
            this.$store.unregisterModule('artistsAdmin');
        }
    },
    methods: {
        async loadRelevantFeaturedArtists(e): Promise<void> {
            const featuredArtists = await this.$http.executeGet<FeaturedArtist[]>('/admin/featuredArtists/loadRelevant', e);

            if (!this.$http.isError(featuredArtists)) {
                this.$store.commit('setFeaturedArtists', featuredArtists);
            }
        },
        async loadAllFeaturedArtists(e): Promise<void> {
            const featuredArtists = await this.$http.executeGet<FeaturedArtist[]>('/admin/featuredArtists/loadAll', e);

            if (!this.$http.isError(featuredArtists)) {
                this.$store.commit('setFeaturedArtists', featuredArtists);
            }
        },
    },
});
</script>
