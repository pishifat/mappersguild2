<template>
    <div>
        <div class="container bg-container py-1">
            <div class="row">
                <div class="col-sm">
                    <data-table
                        #default="{ obj: featuredArtist }"
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
            @update-featured-artist="updateFeaturedArtist($event)"
        />

        <toast-messages />
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import FeaturedArtistInfo from '../../components/admin/FeaturedArtistInfo.vue';
import DataTable from '../../components/admin/DataTable.vue';
import ToastMessages from '../../components/ToastMessages.vue';
import { FeaturedArtist } from '../../../interfaces/featuredArtist';
import { mapState } from 'vuex';

export default Vue.extend({
    components: {
        DataTable,
        FeaturedArtistInfo,
        ToastMessages,
    },
    data () {
        return {
            selectedFeaturedArtistId: '',
        };
    },
    computed: {
        ...mapState(['featuredArtists']),
        selectedFeaturedArtist(): undefined | FeaturedArtist {
            return this.featuredArtists.find(fa => fa.id === this.selectedFeaturedArtistId);
        },
    },
    async created() {
        const featuredArtists = await this.executeGet<FeaturedArtist[]>('/admin/featuredArtists/load');

        if (!this.isError(featuredArtists)) {
            this.$store.commit('setFeaturedArtists', featuredArtists);
        }

        $('#loading').fadeOut();
        $('#app')
            .attr('style', 'visibility: visible')
            .hide()
            .fadeIn();
    },
    methods: {
        updateFeaturedArtist(fa): void {
            const i = this.featuredArtists.findIndex(featuredArtist => featuredArtist.id == fa.id);

            if (i !== -1) {
                Vue.set(this.featuredArtists, i, fa);
            }
        },
    },
});
</script>
