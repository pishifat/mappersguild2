<template>
    <div>
        <artist-page-filters />

        <artists-in-progress />

        <div class="radial-divisor" />

        <artists-planned />

        <div class="radial-divisor" />

        <artists-inactive />

        <add-artist />
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import AddArtist from '@components/artists/AddArtist.vue';
import ArtistPageFilters from './ArtistPageFilters.vue';
import ArtistsInProgress from './ArtistsInProgress.vue';
import ArtistsPlanned from './ArtistsPlanned.vue';
import ArtistsInactive from './ArtistsInactive.vue';
import artistsModule from '@store/artists';

export default Vue.extend({
    name: 'ArtistPage',
    components: {
        ArtistPageFilters,
        ArtistsInProgress,
        ArtistsPlanned,
        ArtistsInactive,
        AddArtist,
    },
    beforeCreate () {
        if (!this.$store.hasModule('artists')) {
            this.$store.registerModule('artists', artistsModule);
        }
    },
    destroyed() {
        if (this.$store.hasModule('artists')) {
            this.$store.unregisterModule('artists');
        }
    },
    async created () {
        const res: any = await this.initialRequest('/artists/relevantInfo');

        if (res) {
            this.$store.commit('setArtists', res.artists);
        }
    },
});
</script>
