<template>
    <div class="container card card-body py-1">
        <div class="row">
            <div class="col">
                <h3 class="ml-2">
                    In-progress
                </h3>

                <h5 class="ml-4">
                    <a href="#ready" data-toggle="collapse">
                        Ready ({{ readyArtists.length }})
                        <i class="fas fa-angle-down" />
                    </a>
                </h5>

                <div id="ready" class="show">
                    <transition-group name="list" tag="div" class="row">
                        <artist-card
                            v-for="artist in readyArtists"
                            :key="artist.id"
                            :artist="artist"
                        />
                    </transition-group>
                </div>

                <h5 class="ml-4 mt-2">
                    <a href="#contractArtists" data-toggle="collapse">
                        Contract ({{ contractArtists.length }})
                        <i class="fas fa-angle-down" />
                    </a>
                </h5>

                <div id="contractArtists" class="collapse">
                    <transition-group name="list" tag="div" class="row">
                        <artist-card
                            v-for="artist in contractArtists"
                            :key="artist.id"
                            :artist="artist"
                        />
                    </transition-group>
                </div>

                <h5 class="ml-4 mt-2">
                    <a href="#discussionArtists" data-toggle="collapse">
                        Discussion ({{ discussionArtists.length }})
                        <i class="fas fa-angle-down" />
                    </a>
                </h5>

                <div id="discussionArtists" class="collapse">
                    <transition-group name="list" tag="div" class="row">
                        <artist-card
                            v-for="artist in discussionArtists"
                            :key="artist.id"
                            :artist="artist"
                        />
                    </transition-group>
                </div>

                <h5 v-if="updateAvailableArtists.length" class="ml-4 mt-2">
                    <a href="#currentArtistUpdates" data-toggle="collapse">
                        Current artist updates ({{ updateAvailableArtists.length }})
                        <i class="fas fa-angle-down" />
                    </a>
                </h5>

                <div id="currentArtistUpdates" class="collapse">
                    <transition-group name="list" tag="div" class="row">
                        <artist-card
                            v-for="artist in updateAvailableArtists"
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
    name: 'ArtistsInProgress',
    components: {
        ArtistCard,
    },
    computed: mapGetters([
        'readyArtists',
        'discussionArtists',
        'contractArtists',
        'updateAvailableArtists',
    ]),
});
</script>
