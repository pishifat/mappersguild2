import { Module } from 'vuex';
import { Mission, MissionStatus } from '@interfaces/mission';
import { MainState } from '@store/main';

export interface MissionsState {
    missions: Mission[];
    isLoadingMissions: boolean;
    isFirstLoadDone: boolean;
}

const store: Module<MissionsState, MainState> = {
    namespaced: true,
    state: {
        missions: [] as Mission[],
        isLoadingMissions: true,
        isFirstLoadDone: false,
    },
    mutations: {
        setFirstLoadDone (state): void {
            state.isFirstLoadDone = true;
        },
        setMissions (state, missions: Mission[]): void {
            state.missions = missions;
        },
        updateMission (state, mission: Mission): void {
            const i = state.missions.findIndex(m => m.id === mission.id);
            if (i !== -1) state.missions[i] = mission;
        },
    },
    getters: {
        filteredMissions: (state): Mission[] => {
            let missions = state.missions;

            /*if (state.filterMode !== FilterMode.any) {
                const mode = state.filterMode;
                quests = quests.filter(q => q.modes.includes(mode));
            }

            if (state.filterValue.length > 2) {
                quests = quests.filter(q => {
                    return q.name.toLowerCase().includes(state.filterValue.toLowerCase());
                });
            }*/

            return missions;
        },
        openMissions: (state, getters): Mission[] => {
            return getters.filteredMissions.filter(m => m.status == MissionStatus.Open);
        },
        closedMissions: (state, getters): Mission[] => {
            return getters.filteredMissions.filter(m => m.status == MissionStatus.Closed);
        },
    },
};

export default store;
