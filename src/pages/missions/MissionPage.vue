<template>
    <div>
        <mission-page-filters />
        <mission-information />
        <div class="radial-divisor" />
        <div class="container card card-body my-2">
            <h4>
                <a href="#openMissions" data-bs-toggle="collapse" @click.prevent>
                    Active priority quests
                    <i class="fas fa-angle-down" />
                </a>
            </h4>
            <div id="openMissions" class="collapse show">
                <mission-card
                    v-for="mission in openMissions"
                    :key="mission.id"
                    :mission="mission"
                />
                <hr />
                <div v-if="separateMissions && separateMissions.length">
                    <h6>Quests below are only accessible if you selected a song before the deadline</h6>
                    <mission-card
                        v-for="mission in separateMissions"
                        :key="mission.id"
                        :mission="mission"
                    />
                </div>
            </div>
        </div>
        <div class="container card card-body my-4">
            <h4>
                <a href="#closedMissions" data-bs-toggle="collapse" @click.prevent>
                    Inactive priority quests
                    <i class="fas fa-angle-down" />
                </a>
            </h4>
            <button v-if="!closedMissions.length" class="btn btn-sm w-100 btn-outline-info mb-2 pt-3 pb-2" @click="loadInactiveMissions($event)">
                <h6>Load inactive priority quests</h6>
            </button>
            <div id="closedMissions" class="show">
                <mission-card
                    v-for="mission in closedMissions"
                    :key="mission.id"
                    :mission="mission"
                />
            </div>
        </div>

        <mission-info-modal />
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { mapGetters, mapState } from 'vuex';
import missionsModule from '@store/missions';
import MissionCard from '@components/missions/MissionCard.vue';
import MissionInfoModal from '@components/missions/MissionInfoModal.vue';
import MissionInformation from '@components/missions/MissionInformation.vue';
import MissionPageFilters from './MissionPageFilters.vue';
import { Mission } from '../../../interfaces/mission';
import { Beatmap } from '../../../interfaces/beatmap/beatmap';

export default defineComponent({
    name: 'MissionPage',
    components: {
        MissionCard,
        MissionInformation,
        MissionPageFilters,
        MissionInfoModal,
    },
    computed: {
        ...mapState([
            'loggedInUser',
        ]),
        ...mapState('missions', [
            'isFirstLoadDone',
            'isLoadingMissions',
        ]),
        ...mapGetters('missions', [
            'openMissions',
            'closedMissions',
            'selectedMission',
            'separateMissions',
        ]),
    },
    beforeCreate () {
        if (!this.$store.hasModule('missions')) {
            this.$store.registerModule('missions', missionsModule);
        }
    },
    async created () {
        const id = this.$route.query.id;
        let url = `/missions/relevantInfo`;

        const res = await this.$http.initialRequest<{ missions: Mission[], beatmaps: Beatmap[] }>(url);

        if (!this.$http.isError(res)) {
            this.$store.commit('missions/setMissions', res.missions);
            this.$store.commit('missions/setUserBeatmaps', res.beatmaps);
            this.$store.commit('missions/setFilterMode', this.loggedInUser.mainMode);
            this.$store.commit('missions/setFirstLoadDone');

            if (id) { // this process will need to change when all missions aren't loaded
                if (res.missions.some(m => m.id == id)) {
                    this.$store.commit('missions/setSelectedMissionId', id);
                    this.$bs.showModal('editMission');
                }
            }
        }

        const mission = await this.$http.executeGet<Mission>('/exampleMission');

        if (!this.$http.isError(mission)) {
            this.$store.commit('missions/setExampleMission', mission);
        }
    },
    methods: {
        async loadInactiveMissions (e) {
            const res2 = await this.$http.executeGet<{ missions: Mission[] }>(`/missions/loadInactiveMissions`, e);

            if (!this.$http.isError(res2)) {
                this.$store.commit('missions/addMissions', res2.missions);
            }
        },
    },
});
</script>
