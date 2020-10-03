<template>
    <div class="container bg-container py-1">
        <div class="row">
            <div class="col">
                <h3 class="ml-2">
                    Planned
                </h3>

                <h5 class="ml-4 mt-2">
                    <a href="#notContacted" data-toggle="collapse">
                        Not contacted ({{ notContacted.length }})
                        <i class="fas fa-angle-down" />
                    </a>
                    <button class="btn btn-sm btn-outline-info" data-toggle="modal" data-target="#addArtist">
                        Add artist
                    </button>
                </h5>

                <div id="notContacted" class="collapse">
                    <transition-group name="list" tag="div" class="row">
                        <artist-card
                            v-for="artist in notContacted"
                            :key="artist.id"
                            :artist="artist"
                        />
                    </transition-group>
                    <div class="radial-divisor mx-auto my-4" />
                </div>

                <h5 v-if="contactedArtists.length" class="ml-4 mt-2">
                    <a href="#contactedArtists" data-toggle="collapse">
                        Awaiting response ({{ contactedArtists.length }})
                        <i class="fas fa-angle-down" />
                    </a>
                    <button class="btn btn-sm btn-outline-info" @click="setAllAsRejected($event)">
                        Mark all as rejected
                    </button>
                </h5>

                <div id="contactedArtists" class="collapse">
                    <transition-group name="list" tag="div" class="row">
                        <artist-card
                            v-for="artist in contactedArtists"
                            :key="artist.id"
                            :artist="artist"
                        />
                    </transition-group>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import ArtistCard from '@components/artists/ArtistCard.vue';
import { mapGetters } from 'vuex';

export default Vue.extend({
    name: 'ArtistsPlanned',
    components: {
        ArtistCard,
    },
    computed: mapGetters([
        'notContacted',
        'contactedArtists',
    ]),
    methods: {
        async setAllAsRejected (e): Promise<void> {
            const artists = await this.executePost('/artists/setAllAsRejected/', {}, e);

            if (artists) {
                this.$store.commit('setArtists', artists);
            }
        },
    },
});
</script>
