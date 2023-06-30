<template>
    <div>
        <div class="radial-divisor" />

        <artist-page-filters />

        <artists-in-progress class="mb-2" />

        <artists-planned class="mb-2" />

        <artists-inactive />

        <div class="radial-divisor" />

        <!--<osu-beatmaps-list />

        <div class="radial-divisor" />-->

        <artist-search class="mb-2 card card-body" />

        <mail-generator v-if="loggedInUser.osuId == 1893718" />

        <add-artist />
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { mapState } from 'vuex';
import AddArtist from '@components/artists/AddArtist.vue';
import ArtistPageFilters from './ArtistPageFilters.vue';
import ArtistsInProgress from './ArtistsInProgress.vue';
import ArtistsPlanned from './ArtistsPlanned.vue';
import ArtistsInactive from './ArtistsInactive.vue';
//import OsuBeatmapsList from '@components/artists/OsuBeatmapsList.vue';
import ArtistSearch from '@components/artists/ArtistSearch.vue';
import MailGenerator from '@components/artists/MailGenerator.vue';
import artistsModule from '@store/artists';

export default defineComponent({
    name: 'ArtistPage',
    components: {
        ArtistPageFilters,
        ArtistsInProgress,
        ArtistsPlanned,
        ArtistsInactive,
        AddArtist,
        ArtistSearch,
        //OsuBeatmapsList,
        MailGenerator,
    },
    computed: {
        ...mapState([
            'loggedInUser',
        ]),
    },
    beforeCreate () {
        if (!this.$store.hasModule('artists')) {
            this.$store.registerModule('artists', artistsModule);
        }
    },
    unmounted () {
        if (this.$store.hasModule('artists')) {
            this.$store.unregisterModule('artists');
        }
    },
    async created () {
        const res: any = await this.$http.initialRequest('/artists/relevantInfo');

        if (res) {
            this.$store.commit('setArtists', res.artists);
        }
    },
});
</script>
