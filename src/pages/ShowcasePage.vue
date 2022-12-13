<template>
    <div>
        <div class="container card card-body py-3 mb-3">
            <h5>readme.txt</h5>
            <ol class="small text-secondary">
                <li>
                    These are some of the Featured Artists planned to be announced in the next few months. This is not an exhaustive list of all upcoming Featured Artists, and some may not be announced until later.
                </li>
                <li>
                    As a *special showcase mapper person*, you're trusted to not leak anything on this page. So don't leak anything.
                </li>
                <li>
                    Clicking an artist will display their info + songs you can map.
                </li>
                <li>
                    <span class="text-warning">Yellow</span> artists are desperate for new maps, and will likely feature your map in the announcement video (if you're the only mapper).
                </li>
                <li>
                    If you're interested mapping a song from an artist, mark it with <span class="text-success">add</span> (or <span class="text-danger">remove</span> if you change your mind). You can optionally mark a specific song too. pishifat will talk to you about the next steps once you've expressed interest.
                </li>
                <li>
                    Deadlines are flexible. Talk to pishifat if you want to map an artist, but the deadline is holding you back.
                </li>
            </ol>
            <hr />
            <h5>Upcoming Featured Artists</h5>
            <ul>
                <li v-for="artist in showcaseArtists" :key="artist.id">
                    <artist-details
                        :artist="artist"
                    />
                </li>
                <li v-if="!showcaseArtists || !showcaseArtists.length">
                    You're not supposed to be here. Or something went wrong. Talk to pishifat if you're expecting a list of artists.
                </li>
            </ul>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import showcaseModule from '@store/showcase';
import { mapState } from 'vuex';
import ArtistDetails from '@components/showcase/ArtistDetails.vue';

export default defineComponent({
    name: 'ShowcasePage',
    components: {
        ArtistDetails,
    },
    computed: {
        ...mapState('showcase', [
            'showcaseArtists',
        ]),
    },
    beforeCreate () {
        if (!this.$store.hasModule('showcase')) {
            this.$store.registerModule('showcase', showcaseModule);
        }
    },
    async created() {
        const res: any = await this.$http.initialRequest('/showcase/relevantInfo');

        if (res) {
            this.$store.commit('showcase/setShowcaseArtists', res.artists);
        }
    },
});
</script>
