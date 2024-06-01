<template>
    <div class="container card card-body py-3 my-2">
        <h5>Recent mission winners</h5>
        <div class="mb-2">
            Load winners of missions created after given date
        </div>
        <div class="row mb-2 mx-1">
            <input
                v-model="date"
                class="form-control form-control-sm mx-2 w-25"
                type="date"
                autocomplete="off"
                placeholder="how far back to check"
            />
            <button class="btn btn-sm btn-info w-25" @click="loadRecentMissionWinners($event)">
                Load recent mission winners
            </button>
        </div>
        <!--<div v-if="artists.length">
            <copy-paste :distinct="'artists'">
                <div v-for="(artist, i) in artists" :key="i">
                    {{ artist.rankedMaps }} - <a :href="`https://osu.ppy.sh/beatmaps/artists/${artist.osuId}`">{{ artist.name }}</a>
                </div>
            </copy-paste>
        </div>-->
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import CopyPaste from '../../CopyPaste.vue';

export default defineComponent({
    name: 'RecentMissionWinners',
    components: {
        CopyPaste,
    },
    data() {
        return {
            missions: [] as any[],
            date: '2024-01-01',
        };
    },
    methods: {
        async loadRecentMissionWinners (e): Promise<void> {
            const res: any = await this.$http.executePost('/admin/missions/loadRecentMissionWinners', { date: this.date }, e);

            if (res && !res.error) {
                this.missions = res.missions;
            }
        },
    },
});
</script>
