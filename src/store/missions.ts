import { Module } from 'vuex';
import { Mission, MissionStatus } from '@interfaces/mission';
import { Beatmap } from '@interfaces/beatmap/beatmap';
import { MainState } from '@store/main';

export interface MissionsState {
    filterValue: string;
    missions: Mission[];
    userBeatmaps: Beatmap[];
    isLoadingMissions: boolean;
    isFirstLoadDone: boolean;
}

const store: Module<MissionsState, MainState> = {
    namespaced: true,
    state: {
        filterValue: '',
        missions: [] as Mission[],
        userBeatmaps: [] as Beatmap[],
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
        setUserBeatmaps (state, beatmaps: Beatmap[]): void {
            state.userBeatmaps = beatmaps;
        },
        setFilterValue (state, value: string): void {
            state.filterValue = value;
        },
        updateMission (state, mission: Mission): void {
            const i = state.missions.findIndex(m => m.id === mission.id);
            if (i !== -1) state.missions[i] = mission;
        },
    },
    getters: {
        filteredMissions: (state): Mission[] => {
            let missions = state.missions;

            if (state.filterValue.length > 2) {
                missions = missions.filter(m => {
                    return m.name.toLowerCase().includes(state.filterValue.toLowerCase());
                });
            }

            return missions;
        },
        openMissions: (state, getters): Mission[] => {
            return getters.filteredMissions.filter(m => m.status == MissionStatus.Open);
        },
        closedMissions: (state, getters): Mission[] => {
            return getters.filteredMissions.filter(m => m.status == MissionStatus.Closed);
        },
    },
    actions: {
        updateFilterValue ({ commit }, value: string): void {
            commit('setFilterValue', value);
        },
    },
};

export default store;
