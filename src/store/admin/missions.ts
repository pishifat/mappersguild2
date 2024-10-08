import { Module } from 'vuex';
import { MainState } from '@store/main';
import { Mission } from '../../../interfaces/mission';

interface MissionState {
    missions: Mission[];
}

const store: Module<MissionState, MainState> = {
    state: {
        missions: [],
    },
    mutations: {
        setMissions (state, missions: Mission[]): void {
            state.missions = missions;
        },
        updateMission (state, mission: Mission): void {
            const i = state.missions.findIndex(m => m.id === mission.id);
            if (i !== -1) state.missions[i] = mission;
        },
        addMission (state, mission: Mission): void {
            state.missions.push(mission);
        },
        updateName (state, payload): void {
            const mission = state.missions.find(m => m.id == payload.missionId);

            if (mission) {
                mission.name = payload.name;
            }
        },
        updateTier (state, payload): void {
            const mission = state.missions.find(m => m.id == payload.missionId);

            if (mission) {
                mission.tier = payload.tier;
            }
        },
        updateObjective (state, payload): void {
            const mission = state.missions.find(m => m.id == payload.missionId);

            if (mission) {
                mission.objective = payload.objective;
            }
        },
        updateStatus (state, payload): void {
            const mission = state.missions.find(m => m.id == payload.missionId);

            if (mission) {
                mission.status = payload.status;
            }
        },
        updateWinCondition (state, payload): void {
            const mission = state.missions.find(m => m.id == payload.missionId);

            if (mission) {
                mission.winCondition = payload.winCondition;
            }
        },
        updateIsShowcaseMission (state, payload): void {
            const mission = state.missions.find(m => m.id == payload.missionId);

            if (mission) {
                mission.isShowcaseMission = payload.isShowcaseMission;
            }
        },
        updateIsSeparate (state, payload): void {
            const mission = state.missions.find(m => m.id == payload.missionId);

            if (mission) {
                mission.isSeparate = payload.isSeparate;
            }
        },
        updateOpeningAnnounced (state, payload): void {
            const mission = state.missions.find(m => m.id == payload.missionId);

            if (mission) {
                mission.openingAnnounced = payload.openingAnnounced;
            }
        },
        updateClosingAnnounced (state, payload): void {
            const mission = state.missions.find(m => m.id == payload.missionId);

            if (mission) {
                mission.closingAnnounced = payload.closingAnnounced;
            }
        },
        updateWinningBeatmaps (state, payload): void {
            const mission = state.missions.find(m => m.id == payload.missionId);

            if (mission) {
                mission.winningBeatmaps = payload.winningBeatmaps;
            }
        },
        updateInvalidBeatmaps (state, payload): void {
            const mission = state.missions.find(m => m.id == payload.missionId);

            if (mission) {
                mission.invalidBeatmaps = payload.invalidBeatmaps;
            }
        },
        updateAssociatedMaps (state, payload): void {
            const mission = state.missions.find(m => m.id == payload.missionId);

            if (mission) {
                mission.associatedMaps = payload.associatedMaps;
            }
        },
        updateModes (state, payload): void {
            const mission = state.missions.find(m => m.id == payload.missionId);

            if (mission) {
                mission.modes = payload.modes;
            }
        },
        updateArtists (state, payload): void {
            const mission = state.missions.find(m => m.id == payload.missionId);

            if (mission) {
                mission.artists = payload.artists;
            }
        },
        updateUserMaximumRankedBeatmapsCount (state, payload): void {
            const mission = state.missions.find(m => m.id == payload.missionId);

            if (mission) {
                mission.userMaximumRankedBeatmapsCount = payload.userMaximumRankedBeatmapsCount;
            }
        },
        updateUserMaximumGlobalRank (state, payload): void {
            const mission = state.missions.find(m => m.id == payload.missionId);

            if (mission) {
                mission.userMaximumGlobalRank = payload.userMaximumGlobalRank;
            }
        },
        updateUserMaximumPp (state, payload): void {
            const mission = state.missions.find(m => m.id == payload.missionId);

            if (mission) {
                mission.userMaximumPp = payload.userMaximumPp;
            }
        },
        updateUserMinimumPp (state, payload): void {
            const mission = state.missions.find(m => m.id == payload.missionId);

            if (mission) {
                mission.userMinimumPp = payload.userMinimumPp;
            }
        },
        updateUserMinimumRank (state, payload): void {
            const mission = state.missions.find(m => m.id == payload.missionId);

            if (mission) {
                mission.userMinimumRank = payload.userMinimumRank;
            }
        },
        updateBeatmapEarliestSubmissionDate (state, payload): void {
            const mission = state.missions.find(m => m.id == payload.missionId);

            if (mission) {
                mission.beatmapEarliestSubmissionDate = payload.beatmapEarliestSubmissionDate;
            }
        },
        updateBeatmapLatestSubmissionDate (state, payload): void {
            const mission = state.missions.find(m => m.id == payload.missionId);

            if (mission) {
                mission.beatmapLatestSubmissionDate = payload.beatmapLatestSubmissionDate;
            }
        },
        updateBeatmapMinimumFavorites (state, payload): void {
            const mission = state.missions.find(m => m.id == payload.missionId);

            if (mission) {
                mission.beatmapMinimumFavorites = payload.beatmapMinimumFavorites;
            }
        },
        updateBeatmapMinimumPlayCount (state, payload): void {
            const mission = state.missions.find(m => m.id == payload.missionId);

            if (mission) {
                mission.beatmapMinimumPlayCount = payload.beatmapMinimumPlayCount;
            }
        },
        updateBeatmapMinimumLength (state, payload): void {
            const mission = state.missions.find(m => m.id == payload.missionId);

            if (mission) {
                mission.beatmapMinimumLength = payload.beatmapMinimumLength;
            }
        },
        updateIsUniqueToRanked (state, payload): void {
            const mission = state.missions.find(m => m.id == payload.missionId);

            if (mission) {
                mission.isUniqueToRanked = payload.isUniqueToRanked;
            }
        },
        updateDeadline (state, payload): void {
            const mission = state.missions.find(m => m.id == payload.missionId);

            if (mission) {
                mission.deadline = payload.deadline;
            }
        },
    },
};

export default store;
