<template>
    <div class="container card card-body py-3 my-2">
        <h5>Recently licensed songs</h5>
        <button class="btn btn-sm w-100 btn-info" @click="findRecentlyLicensedSongs($event)">
            Load recently licensed songs
        </button>

        <!-- todo: add date input and remove hard-coded dates from route -->

        <div v-if="songs.length">
            <copy-paste :distinct="'songs'">
                <div v-for="(song, i) in songs" :key="i">
                    {{ song.artist }} - {{ song.title }}
                </div>
            </copy-paste>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import CopyPaste from '../CopyPaste.vue';
import { FeaturedSong } from '../../../interfaces/featuredSong';

export default defineComponent({
    name: 'RecentLicensedSongs',
    components: {
        CopyPaste,
    },
    data() {
        return {
            songs: [] as FeaturedSong[],
        };
    },
    methods: {
        async findRecentlyLicensedSongs(e): Promise<void> {
            const res: any = await this.$http.executeGet('/admin/featuredArtists/findRecentlyLicensedSongs', e);

            if (res && !res.error) {
                this.songs = res.songs;
            }
        },
    },
});
</script>
