<template>
    <div v-cloak>
        <artist-page-filters />

        <artists-in-progress />

        <div class="radial-divisor mx-auto my-4" />

        <artists-inactive />

        <toast-messages />

        <add-artist />
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import AddArtist from '@components/artists/AddArtist.vue';
import ToastMessages from '@components/ToastMessages.vue';
import ArtistPageFilters from './ArtistPageFilters.vue';
import ArtistsInProgress from './ArtistsInProgress.vue';
import ArtistsInactive from './ArtistsInactive.vue';

export default Vue.extend({
    name: 'ArtistPage',
    components: {
        ArtistPageFilters,
        ArtistsInProgress,
        ArtistsInactive,
        AddArtist,
        ToastMessages,
    },
    async created () {
        const res: any = await this.executeGet('/artists/relevantInfo');

        if (res) {
            this.$store.commit('setArtists', res.artists);
            this.$store.commit('setUserId', res.userId);
        }

        $('#loading').fadeOut();
        $('#app')
            .attr('style', 'visibility: visible')
            .hide()
            .fadeIn();
    },
});
</script>

<style>
.collapsing {
    -webkit-transition: none;
    transition: none;
    display: none;
}
</style>
