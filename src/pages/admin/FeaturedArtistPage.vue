<template>
    <div>
        <div class="container card card-body py-1">
            <div class="row">
                <div class="col-sm">
                    <data-table
                        v-slot="{ obj: featuredArtist }"
                        :data="featuredArtists"
                        :headers="['ARTIST']"
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
            </div>
        </div>

        <recent-licensed-songs />

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
import DataTable from '../../components/admin/DataTable.vue';
import { FeaturedArtist } from '../../../interfaces/featuredArtist';
import artistsAdminModule from '@store/admin/featuredArtists';

export default defineComponent({
    components: {
        DataTable,
        FeaturedArtistInfo,
        RecentLicensedSongs,
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
    async created() {
        const featuredArtists = await this.$http.initialRequest<FeaturedArtist[]>('/admin/featuredArtists/load');

        if (!this.$http.isError(featuredArtists)) {
            this.$store.commit('setFeaturedArtists', featuredArtists);
        }
    },
});
</script>
