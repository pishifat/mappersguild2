<template>
    <div class="container card card-body py-1">
        <div class="row">
            <div class="col">
                <h3 class="ms-2">
                    Scheduled
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
                    <a href="#stalledArtists" data-bs-toggle="collapse">
                        Stalled ({{ stalledArtists.length }})
                        <i class="fas fa-angle-down" />
                    </a>
                </h5>

                <div id="stalledArtists" class="collapse">
                    <transition-group name="list" tag="div" class="row">
                        <artist-card
                            v-for="artist in stalledArtists"
                            :key="artist.id"
                            :artist="artist"
                        />
                    </transition-group>
                </div>

                <h5 class="ms-4 mt-2">
                    <a href="#pendingShowcaseArtists" data-bs-toggle="collapse">
                        Pending showcase ({{ pendingShowcaseArtists.length }})
                        <i class="fas fa-angle-down" />
                    </a>
                </h5>

                <div id="pendingShowcaseArtists" class="collapse">
                    <transition-group name="list" tag="div" class="row">
                        <artist-card
                            v-for="artist in pendingShowcaseArtists"
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
    name: 'ArtistsScheduled',
    components: {
        ArtistCard,
    },
    computed: mapGetters([
        'readyArtists',
        'stalledArtists',
        'pendingShowcaseArtists',
    ]),
});
</script>
