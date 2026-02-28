<template>
    <div class="container card card-body py-3 mb-2">
        <h5>Classified quest artists</h5>
        <button class="btn btn-sm btn-info w-100 mb-2" @click="loadClassifiedArtists($event)">
            Load artists eligible for Classified quest
        </button>
        <div>This shows unreleased artists who are marked with <code>[showcase]</code>, have <code>[timing]</code> completed, and have songs added to MG database.</div>
        <div>
            <ul>
                <li v-for="artist in classifiedArtists" :key="artist.id">
                    {{ artist.label }}
                    <span class="small text-secondary">{{ countValidSongs(artist.songs) }}</span>
                </li>
            </ul>
        </div>

        <h5>Previous classified quests</h5>
        <ul>
            <li v-for="mission in classifiedQuests" :key="mission.id" class="mb-2">
                {{ mission.name }}
                <button class="btn btn-sm btn-outline-info ms-1" @click="toggleQuestArtists(mission.id, $event)">
                    Load artists
                </button>
                <ul v-if="questArtists[mission.id]">
                    <li v-for="artist in questArtists[mission.id]" :key="artist.label">
                        <a v-if="artist.osuId > 0" :href="`https://osu.ppy.sh/beatmaps/artists/${artist.osuId}`" target="_blank">{{ artist.label }}</a>
                        <span v-else :class="artist.isLatest ? 'text-success' : ''">{{ artist.label }}</span>
                    </li>
                </ul>
            </li>
        </ul>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { FeaturedSong } from '../../../../interfaces/featuredSong';

export default defineComponent({
    data() {
        return {
            classifiedArtists: [] as any[],
            classifiedQuests: [] as any[],
            questArtists: {} as Record<string, { label: string, osuId: number, isLatest: boolean }[]>,
        };
    },
    async mounted() {
        await this.loadClassifiedQuests();
    },
    methods: {
        async loadClassifiedArtists(e): Promise<void> {
            const result = await this.$http.executeGet<any[]>('/admin/missions/loadClassifiedArtists', e);

            if (!this.$http.isError(result)) {
                this.classifiedArtists = result;
            }
        },
        async loadClassifiedQuests(): Promise<void> {
            const result = await this.$http.executeGet<any[]>('/admin/missions/loadClassifiedQuests');

            if (!this.$http.isError(result)) {
                this.classifiedQuests = result;
            }
        },
        async toggleQuestArtists(missionId: string, e): Promise<void> {
            if (this.questArtists[missionId]) {
                delete this.questArtists[missionId];

                return;
            }

            const result = await this.$http.executeGet<{ label: string, osuId: number, isLatest: boolean }[]>(`/admin/missions/${missionId}/loadClassifiedQuestArtists`, e);

            if (!this.$http.isError(result)) {
                this.questArtists[missionId] = result;
            }
        },
        countValidSongs(songs: FeaturedSong[]): string {
            const invalids: string[] = [];

            for (const song of songs) {
                if (song.isExcludedFromClassified || !song.oszUrl) {
                    invalids.push(`${song.artist} - ${song.title}`);
                }
            }

            if (invalids.length) {
                return `(${songs.length - invalids.length} of ${songs.length}) ${invalids.join(', ')}`;
            }

            return '';
        },
    },
});
</script>

