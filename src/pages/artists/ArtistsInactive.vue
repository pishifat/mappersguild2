<template>
    <div class="container bg-container py-1">
        <div class="row">
            <div class="col">
                <h3 class="ml-2">
                    Inactive
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
                    <div class="radial-divisor mx-auto my-4" />
                </div>

                <h5 class="ml-4 mt-2">
                    <a href="#rejected" data-toggle="collapse">
                        Rejected/Ghosted ({{ rejected.length }})
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
                    <div class="radial-divisor mx-auto my-4" />
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
        'upToDate',
        'rejected',
    ]),
});
</script>
