<template>
    <div class="container card card-body py-1 my-2">
        load artists and mg ranked maps info between date below and today
        <div class="row mb-2 mx-1">
            <input
                v-model="date"
                class="form-control form-control-sm mx-2 w-25"
                type="date"
                autocomplete="off"
                placeholder="how far back to check"
            />
            <input
                v-model="threshold"
                class="form-control form-control-sm mx-2 w-25"
                type="number"
                autocomplete="off"
                placeholder="how many maps"
            />
            <button class="btn btn-sm btn-outline-info w-25" @click="loadArtists($event)">
                Load artists
            </button>
        </div>
        <div v-if="artists.length">
            <copy-paste :distinct="'artists'">
                <div v-for="(artist, i) in artists" :key="i">
                    {{ artist.rankedMaps }} - <a :href="`https://osu.ppy.sh/beatmaps/artists/${artist.osuId}`">{{ artist.name }}</a>
                </div>
            </copy-paste>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import CopyPaste from '../CopyPaste.vue';

export default defineComponent({
    name: 'ArtistRankedMaps',
    components: {
        CopyPaste,
    },
    data() {
        return {
            artists: [] as any[],
            date: '2024-01-01',
            threshold: 0,
        };
    },
    methods: {
        async loadArtists (e): Promise<void> {
            const res: any = await this.$http.executePost('/admin/featuredArtists/loadArtistsWithoutRankedMaps', { date: this.date, threshold: this.threshold }, e);

            if (res && !res.error) {
                this.artists = res.artists;
            }
        },
    },
});
</script>
