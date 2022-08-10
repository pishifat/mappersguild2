<template>
    <div>
        <artist-page-filters />

        <artists-in-progress />

        <div class="radial-divisor" />

        <artists-planned />

        <div class="radial-divisor" />

        <artists-inactive />

        <div class="radial-divisor" />

        <osu-beatmaps-list />

        <div class="radial-divisor" />

        <mail-generator v-if="loggedInUser.osuId == 3178418" />

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
import OsuBeatmapsList from '@components/artists/OsuBeatmapsList.vue';
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
        OsuBeatmapsList,
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
