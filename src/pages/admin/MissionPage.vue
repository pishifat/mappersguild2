<template>
    <div>
        <div class="container card card-body py-3 mb-2">
            <h5>Create mission</h5>
            <button class="btn btn-sm btn-info w-100 mb-1" data-bs-toggle="modal" data-bs-target="#submitMission">
                Add mission
            </button>
        </div>

        <div class="container card card-body py-3 mb-2">
            <h5>Missions list</h5>
            <button class="btn btn-sm btn-info w-100 mb-2" @click="loadMissions($event)">
                Load missions and winners
            </button>

            <data-table
                v-if="missions.length"
                v-slot="{ obj: mission }"
                :data="missions"
                :headers="['name', 'tier', 'status', 'announce']"
                :custom-data-target="'#editMission'"
                @update:selected-id="selectedMissionId = $event"
            >
                <td>
                    {{ mission.name }}
                </td>
                <td>
                    <img :src="findTierImage(mission.tier)" class="table-mission-tier" />
                </td>
                <td>
                    {{ mission.status }}
                </td>
                <td>
                    <span :class="mission.openingAnnounced ? 'text-success' : 'text-danger'">open</span>/<span :class="mission.closingAnnounced ? 'text-success' : 'text-danger'">close</span>
                </td>
            </data-table>

            <mission-winners
                v-if="missions.length"
            />
        </div>

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
        </div>

        <submit-mission-modal />

        <mission-info
            v-if="selectedMission"
            :mission="selectedMission"
            @update-mission="updateMission($event)"
        />
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { mapState } from 'vuex';
import SubmitMissionModal from '../../components/missions/SubmitMissionModal.vue';
import DataTable from '../../components/admin/DataTable.vue';
import { Mission } from '../../../interfaces/mission';
import missionsAdminModule from '@store/admin/missions';
import MissionInfo from '../../components/admin/missions/MissionInfo.vue';
import MissionWinners from '../../components/admin/missions/MissionWinners.vue';
import { FeaturedSong } from '@interfaces/featuredSong';

export default defineComponent({
    components: {
        DataTable,
        SubmitMissionModal,
        MissionInfo,
        MissionWinners,
    },
    data () {
        return {
            selectedMissionId: '',
            classifiedArtists: null,
        };
    },
    computed: {
        ...mapState({
            missions: (state: any) => state.missionsAdmin.missions,
            classifiedArtists: (state: any) => state.classifiedArtists,
        }),
        selectedMission(): undefined | Mission {
            return this.missions.find(m => m.id === this.selectedMissionId);
        },
    },
    beforeCreate () {
        if (!this.$store.hasModule('missionsAdmin')) {
            this.$store.registerModule('missionsAdmin', missionsAdminModule);
        }
    },
    unmounted () {
        if (this.$store.hasModule('missionsAdmin')) {
            this.$store.unregisterModule('missionsAdmin');
        }
    },
    methods: {
        async loadMissions(e): Promise<void> {
            const missions = await this.$http.executeGet<Mission[]>('/admin/missions/load', e);

            if (!this.$http.isError(missions)) {
                this.$store.commit('setMissions', missions);
            }
        },
        async loadClassifiedArtists(e): Promise<void> {
            const classifiedArtists = await this.$http.executeGet<any[]>('/admin/missions/loadClassifiedArtists', e);

            if (!this.$http.isError(classifiedArtists)) {
                this.classifiedArtists = classifiedArtists;
            }
        },
        updateMission(m): void {
            const i = this.missions.findIndex(mission => mission.id == m.id);

            if (i !== -1) {
                this.missions[i] = m;
            }
        },
        findTierImage(tier): string {
            switch (tier) {
                case 1:
                    return '/images/bronze.png';
                case 2:
                    return '/images/silver.png';
                case 3:
                    return '/images/gold.png';
                case 4:
                    return '/images/platinum.png';
                default:
                    return '/images/bronze.png';
            }
        },
        countValidSongs(songs): string {
            let invalids: string[] = [];

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

<style scoped>
.table-mission-tier {
    max-width: 20px;
    max-height: 20px;
    object-fit: cover;
}
</style>
