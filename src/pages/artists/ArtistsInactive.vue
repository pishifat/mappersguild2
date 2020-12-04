<template>
    <div class="container card card-body py-1">
        <div class="row">
            <div class="col">
                <h3 class="ml-2">
                    Inactive
                </h3>

                <h5 class="ml-4 mt-2">
                    <a href="#upToDate" data-toggle="collapse">
                        Up to date ({{ upToDate.length }})
                        <i class="fas fa-angle-down" />
                    </a>
                </h5>

                <div id="upToDate" class="collapse">
                    <transition-group name="list" tag="div" class="row">
                        <artist-card
                            v-for="artist in upToDate"
                            :key="artist.id"
                            :artist="artist"
                        />
                    </transition-group>
                    <div class="radial-divisor" />
                </div>

                <h5 class="ml-4 mt-2">
                    <a href="#rejected" data-toggle="collapse">
                        Rejected ({{ rejected.length }})
                        <i class="fas fa-angle-down" />
                    </a>
                </h5>

                <div id="rejected" class="collapse">
                    <transition-group name="list" tag="div" class="row">
                        <artist-card
                            v-for="artist in rejected"
                            :key="artist.id"
                            :artist="artist"
                        />
                    </transition-group>
                    <div class="radial-divisor" />
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
    name: 'ArtistsInactive',
    components: {
        ArtistCard,
    },
    computed: mapGetters([
        'notContacted',
        'contactedArtists',
        'upToDate',
        'rejected',
    ]),
});
</script>
