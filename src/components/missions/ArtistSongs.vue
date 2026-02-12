<template>
    <div>
        <div><b>All <code>.osz</code> files: <i><a :href="artist.oszTemplatesUrl" target="_blank">{{ artist.oszTemplatesUrl ? 'Download here' : 'none. yell at pishifat' }}</a></i></b></div>
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
import SongDetails from '@components/missions/SongDetails.vue';

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