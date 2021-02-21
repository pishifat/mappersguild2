<template>
    <div class="container card card-body py-1">
        <div class="row">
            <div class="col">
                <h3 class="ms-2">
                    Planned
                </h3>

                <h5 v-if="contactedArtists.length" class="ms-4 mt-2">
                    <a href="#contactedArtists" data-bs-toggle="collapse">
                        Awaiting response ({{ contactedArtists.length }})
                        <i class="fas fa-angle-down" />
                    </a>
                    <button class="btn btn-sm btn-outline-info ms-2" @click="setAllAsRejected($event)">
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

                <h5 class="ms-4 mt-2">
                    <a href="#notContacted" data-bs-toggle="collapse">
                        Not contacted ({{ notContacted.length }})
                        <i class="fas fa-angle-down" />
                    </a>
                    <button class="btn btn-sm btn-outline-info ms-2" data-bs-toggle="modal" data-bs-target="#addArtist">
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
                    <div class="radial-divisor" />
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
            const result = confirm('Are you sure?');

            if (result) {
                const artists = await this.$http.executePost('/artists/setAllAsRejected/', {}, e);

                if (artists) {
                    this.$store.commit('setArtists', artists);
                }
            }
        },
    },
});
</script>
