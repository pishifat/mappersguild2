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

        <featured-artist-info
            :featured-artist="selectedFeaturedArtist"
        />
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapState } from 'vuex';
import FeaturedArtistInfo from '../../components/admin/FeaturedArtistInfo.vue';
import DataTable from '../../components/admin/DataTable.vue';
import { FeaturedArtist } from '../../../interfaces/featuredArtist';
import artistsAdminModule from '@store/admin/featuredArtists';

export default Vue.extend({
    components: {
        DataTable,
        FeaturedArtistInfo,
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
    destroyed() {
        if (this.$store.hasModule('artistsAdmin')) {
            this.$store.unregisterModule('artistsAdmin');
        }
    },
    async created() {
        const featuredArtists = await this.initialRequest<FeaturedArtist[]>('/admin/featuredArtists/load');

        if (!this.isError(featuredArtists)) {
            this.$store.commit('setFeaturedArtists', featuredArtists);
        }
    },
});
</script>
