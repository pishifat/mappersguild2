<template>
    <div class="container card card-body py-1">
        <div class="row">
            <div class="col">
                <h3 class="ms-2">
                    In-progress
                </h3>

                <h5 class="ms-4">
                    <a href="#ready" data-bs-toggle="collapse">
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

                <h5 class="ms-4 mt-2">
                    <a href="#contractArtists" data-bs-toggle="collapse">
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

                <h5 class="ms-4 mt-2">
                    <a href="#discussionArtists" data-bs-toggle="collapse">
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

                <h5 v-if="updateAvailableArtists.length" class="ms-4 mt-2">
                    <a href="#currentArtistUpdates" data-bs-toggle="collapse">
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

                <h5 v-if="commissionPendingArtists.length" class="ms-4 mt-2">
                    <a href="#commissionSongs" data-bs-toggle="collapse">
                        Commission pending artists ({{ commissionPendingArtists.length }})
                        <i class="fas fa-angle-down" />
                    </a>
                </h5>

                <div id="commissionSongs" class="collapse">
                    <transition-group name="list" tag="div" class="row">
                        <artist-card
                            v-for="artist in commissionPendingArtists"
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
import { defineComponent } from 'vue';
import ArtistCard from '@components/artists/ArtistCard.vue';
import { mapGetters } from 'vuex';

export default defineComponent({
    name: 'ArtistsInProgress',
    components: {
        ArtistCard,
    },
    computed: mapGetters([
        'readyArtists',
        'discussionArtists',
        'contractArtists',
        'updateAvailableArtists',
        'commissionPendingArtists',
    ]),
});
</script>
