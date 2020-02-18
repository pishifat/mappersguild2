<template>
    <div class="container bg-container py-1">
        <div class="row">
            <div class="col">
                <h3 class="ml-2">
                    In-progress
                </h3>

                <h5 class="ml-4">
                    <a href="#projectedRelease" data-toggle="collapse">
                        Projected for release ({{ projectedReleaseArtists.length }})
                        <i class="fas fa-angle-down" />
                    </a>
                </h5>

                <div id="projectedRelease" class="show">
                    <transition-group name="list" tag="div" class="row">
                        <artist-card
                            v-for="artist in projectedReleaseArtists"
                            :key="artist.id"
                            :artist="artist"
                        />
                    </transition-group>
                </div>

                <h5 class="ml-4 mt-2">
                    <a href="#discussionArtists" data-toggle="collapse">
                        Active discussion ({{ discussionArtists.length }})
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

                <h5 class="ml-4 mt-2">
                    <a href="#contactedArtists" data-toggle="collapse">
                        Contacted ({{ contactedArtists.length }})
                        <i class="fas fa-angle-down" />
                    </a>
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

                <h5 class="ml-4 mt-2">
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
        'projectedReleaseArtists',
        'discussionArtists',
        'contactedArtists',
        'updateAvailableArtists',
    ]),
});
</script>
