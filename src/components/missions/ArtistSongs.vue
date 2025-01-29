<template>
    <div>
        <b>Artist: <i>{{ artist.label }}</i></b>
        <ul>
            <li v-for="song in artist.songs" :key="song.id" class="text-secondary">
                <song-details
                    :song="song"
                    :is-showcase-mapper="true"
                    :artist-id="artist.id"
                    :route="'missions'"
                    @update-mission="$emit('updateMission')"
                />
            </li>
        </ul>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { FeaturedArtist } from '@interfaces/featuredArtist';
import SongDetails from '@components/showcase/SongDetails.vue';

export default defineComponent({
    name: 'ArtistSongs',
    components: {
        SongDetails,
    },
    props: {
        artist: {
            type: Object as () => FeaturedArtist,
            required: true,
        },
    },
    emits: ['updateMission'],
});
</script>