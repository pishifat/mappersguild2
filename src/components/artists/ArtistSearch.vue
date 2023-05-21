<template>
    <div class="container py-1">
        <div class="row my-2">
            <div class="col">
                <div class="input-group">
                    <button
                        class="btn btn-primary"
                        href="#"
                        @click.prevent="searchArtist($event)"
                    >
                        <i class="fas fa-search" />
                    </button>

                    <input
                        v-model="searchText"
                        class="form-control"
                        type="text"
                        maxlength="100"
                        placeholder="artist name..."
                        autocomplete="off"
                        @keyup.enter="searchArtist($event)"
                    />
                </div>
            </div>
        </div>
        <div v-if="beatmapsets && beatmapsets.length">
            <div><a :href="`https://osu.ppy.sh/beatmapsets?q=artist%3D%22${input}%22`" target="_blank">{{ `https://osu.ppy.sh/beatmapsets?q=artist%3D%22${input}%22` }}</a></div>
            <div><a :href="`https://www.google.com/search?q=%22${input}%22`" target="_blank">{{ `https://www.google.com/search?q=%22${input}%22` }}</a></div>
            <div class="row">
                <div class="col-sm">
                    <table class="table table-sm">
                        <thead>
                            <tr>
                                <th>status</th>
                                <th>plays</th>
                                <th>maps</th>
                                <th>mappers</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>ranked</td>
                                <td>{{ Number(totalRankedPlays).toLocaleString() }}</td>
                                <td :class="totalRankedBeatmapsets > 2 ? 'bg-info' : totalRankedBeatmapsets > 0 ? 'bg-primary' : ''">
                                    {{ totalRankedBeatmapsets }}
                                </td>
                                <td>{{ rankedMappers }}</td>
                            </tr>
                            <tr>
                                <td>unranked</td>
                                <td>{{ Number(totalUnrankedPlays).toLocaleString() }}</td>
                                <td>{{ totalUnrankedBeatmapsets }}</td>
                                <td>{{ unrankedMappers }}</td>
                            </tr>
                            <tr>
                                <td>top 50 maps</td>
                                <td :class="totalPlays > 100000 ? 'bg-info' : totalPlays > 10000 ? 'bg-primary' : ''">
                                    {{ Number(totalRankedPlays + totalUnrankedPlays).toLocaleString() }}
                                </td>
                                <td :class="beatmapsets.length > 49 ? 'bg-info' : beatmapsets.length > 20 ? 'bg-primary' : ''">
                                    {{ totalRankedBeatmapsets + totalUnrankedBeatmapsets }}
                                </td>
                                <td :class="uniqueMappers > 40 ? 'bg-info' : uniqueMappers > 20 ? 'bg-primary' : ''">
                                    {{ uniqueMappers }}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
            <div class="row">
                <div class="col-sm">
                    <table class="table table-sm">
                        <thead>
                            <tr>
                                <th>metadata</th>
                                <th>plays</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="beatmapset in sortedBeatmapsets" :key="beatmapset.id" :class="beatmapset.ranked > 0 ? 'bg-dark' : ''">
                                <td>
                                    <a :href="`https://osu.ppy.sh/beatmapsets/${beatmapset.id}`" target="_blank">{{ beatmapset.artist }} - {{ beatmapset.title }}</a>
                                </td>
                                <td :class="beatmapset.play_count > 10000 ? 'bg-info' : beatmapset.play_count > 1000 ? 'bg-primary' : ''">
                                    {{ Number(beatmapset.play_count).toLocaleString() }}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
        <div v-else-if="searchedOnce && !isLoading">
            no results
        </div>
        <div v-if="isLoading">
            Loading...
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
    name: 'ArtistSearch',
    props: {
        input: {
            type: String,
            default: '',
        },
    },
    data () {
        return {
            beatmapsets: [] as any,
            searchText: this.input,
            searchedOnce: false,
            isLoading: false,
        };
    },
    computed: {
        totalRankedPlays() {
            let count = 0;

            for (const beatmapset of this.beatmapsets) {
                if (beatmapset.ranked > 0) count += beatmapset.play_count;
            }

            return count;
        },
        totalUnrankedPlays() {
            let count = 0;

            for (const beatmapset of this.beatmapsets) {
                if (beatmapset.ranked <= 0) count += beatmapset.play_count;
            }

            return count;
        },
        totalPlays() {
            return this.totalRankedPlays + this.totalUnrankedPlays;
        },
        totalRankedBeatmapsets() {
            let count = 0;

            for (const beatmapset of this.beatmapsets) {
                if (beatmapset.ranked > 0) count ++;
            }

            return count;
        },
        totalUnrankedBeatmapsets() {
            let count = 0;

            for (const beatmapset of this.beatmapsets) {
                if (beatmapset.ranked <= 0) count ++;
            }

            return count;
        },
        rankedMappers() {
            let mappers: string[] = [];

            for (const beatmapset of this.beatmapsets) {
                if (beatmapset.ranked > 0 && !mappers.includes(beatmapset.creator)) {
                    mappers.push(beatmapset.creator);
                }
            }

            return mappers.length;
        },
        unrankedMappers() {
            let mappers: string[] = [];

            for (const beatmapset of this.beatmapsets) {
                if (beatmapset.ranked <= 0 && !mappers.includes(beatmapset.creator)) {
                    mappers.push(beatmapset.creator);
                }
            }

            return mappers.length;
        },
        uniqueMappers() {
            let mappers: string[] = [];

            for (const beatmapset of this.beatmapsets) {
                if (!mappers.includes(beatmapset.creator)) {
                    mappers.push(beatmapset.creator);
                }
            }

            return mappers.length;
        },
        sortedBeatmapsets() {
            const newBeatmapsets = [...this.beatmapsets];

            return newBeatmapsets.sort((a, b) => b.play_count - a.play_count);
        },
    },
    watch: {
        input(): void {
            this.searchText = this.input;
            this.searchArtist(null);
        },
    },
    methods: {
        async searchArtist(e): Promise<void> {
            this.isLoading = true;
            this.beatmapsets = [];
            const searchResults: any = await this.$http.executeGet(`/admin/artistSearch/${this.searchText}`, e);

            this.isLoading = false;
            this.searchedOnce = true;
            this.beatmapsets = searchResults.beatmapsets;
        },
    },
});
</script>
