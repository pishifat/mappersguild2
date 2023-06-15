import { Module } from 'vuex';
import { Mission, MissionStatus, MissionMode } from '@interfaces/mission';
import { Beatmap } from '@interfaces/beatmap/beatmap';
import { MainState } from '@store/main';
import { FilterMode } from '@interfaces/extras';

export interface MissionsState {
    filterValue: string;
    filterMode: MissionMode | string;
    selectedMissionId: string | null;
    missions: Mission[];
    userBeatmaps: Beatmap[];
    isLoadingMissions: boolean;
    isFirstLoadDone: boolean;
    exampleMission: Mission | null;
}

const store: Module<MissionsState, MainState> = {
    namespaced: true,
    state: {
        filterValue: '',
        filterMode: '',
        selectedMissionId: null,
        missions: [] as Mission[],
        userBeatmaps: [] as Beatmap[],
        isLoadingMissions: true,
        isFirstLoadDone: false,
        exampleMission: null,
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
        setExampleMission (state, value: Mission): void {
            state.exampleMission = value;
        },
        setFilterMode (state, value: string): void {
            state.filterMode = value;
        },
        setSelectedMissionId (state, value: string): void {
            state.selectedMissionId = value;
        },
        updateMission (state, mission: Mission): void {
            const i = state.missions.findIndex(m => m.id === mission.id);
            if (i !== -1) state.missions[i] = mission;
        },
    },
    getters: {
        filteredMissions: (state): Mission[] => {
            let missions = state.missions;

            if (state.filterMode !== FilterMode.any) {
                const mode: any = state.filterMode;
                missions = missions.filter(m => m.modes.includes(mode));
            }

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
        selectedMission: (state): Mission | undefined => {
            return state.missions.find(m => m.id === state.selectedMissionId);
        },
    },
    actions: {
        updateFilterValue ({ commit }, value: string): void {
            commit('setFilterValue', value);
        },
        updateFilterMode ({ commit }, value: string): void {
            commit('setFilterValue', '');
            commit('setFilterMode', value);
        },
    },
};

export default store;
