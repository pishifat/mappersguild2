import { Module } from 'vuex';
import { TeamInfo } from '@interfaces/teamInfo';
import { MainState } from './main';

interface TeamState {
    filterValue: string;
    teamInfos: TeamInfo[];
    selfTeamInfo: TeamInfo | null;
    roleIs: 'any' | 'mapper' | 'storyboarder';
}

function syncSelfInListing(state: TeamState): void {
    const i = state.teamInfos.findIndex(l => l.id == state.selfTeamInfo.id);
    if (i > -1) state.teamInfos[i] = state.selfTeamInfo;
}

const store: Module<TeamState, MainState> = {
    namespaced: true,
    state: {
        filterValue: '',
        teamInfos: [],
        selfTeamInfo: null,
        roleIs: 'any',
    },
    mutations: {
        setFilterValue (state, filterValue: string): void {
            state.filterValue = filterValue;
        },
        setTeamInfos (state, teamInfos: TeamInfo[]): void {
            state.teamInfos = teamInfos;
        },
        setSelfTeamInfo (state, selfTeamInfo: TeamInfo): void {
            state.selfTeamInfo = selfTeamInfo;
        },
        setRoleIs (state, roleIs: 'any' | 'mapper' | 'storyboarder'): void {
            state.roleIs = roleIs;
        },
        updateTimezone (state, timezone: string): void {
            state.selfTeamInfo.timezone = timezone;
            syncSelfInListing(state);
        },
        updateAvailability (state, availability: string): void {
            state.selfTeamInfo.availability = availability;
            syncSelfInListing(state);
        },
        updateLanguage (state, language: string): void {
            if (state.selfTeamInfo.languages && state.selfTeamInfo.languages.length) {
                const i = state.selfTeamInfo.languages.findIndex(l => l == language);

                if (i > -1) {
                    state.selfTeamInfo.languages.splice(i, 1);
                } else {
                    state.selfTeamInfo.languages.push(language);
                }
            } else {
                state.selfTeamInfo.languages = [language];
            }

            syncSelfInListing(state);
        },
        updateRole (state, role: string): void {
            if (state.selfTeamInfo.roles && state.selfTeamInfo.roles.length) {
                const i = state.selfTeamInfo.roles.findIndex(r => r == role);

                if (i > -1) {
                    state.selfTeamInfo.roles.splice(i, 1);
                } else {
                    state.selfTeamInfo.roles.push(role);
                }
            } else {
                state.selfTeamInfo.roles = [role];
            }

            syncSelfInListing(state);
        },
        updateDiscord (state, discord: string): void {
            state.selfTeamInfo.discord = discord;
            syncSelfInListing(state);
        },
        updateEmail (state, email: string): void {
            state.selfTeamInfo.email = email;
            syncSelfInListing(state);
        },
        updateAbout (state, about: string): void {
            state.selfTeamInfo.about = about;
            syncSelfInListing(state);
        },
        updateIsPublic (state, isPublic: boolean): void {
            state.selfTeamInfo.isPublic = isPublic;
            syncSelfInListing(state);
        },
        updateIsOnTeam (state, isOnTeam: boolean): void {
            state.selfTeamInfo.isOnTeam = isOnTeam;
            syncSelfInListing(state);
        },
        adminUpdateIsOnTeam (state, payload: { isOnTeam: boolean, id: string }): void {
            const i = state.teamInfos.findIndex(l => l.id == payload.id);
            state.teamInfos[i].isOnTeam = payload.isOnTeam;
            if (state.selfTeamInfo?.id == payload.id) state.selfTeamInfo.isOnTeam = payload.isOnTeam;
        },
        adminUpdateIsHiddenByAdmin (state, payload: { isHiddenByAdmin: boolean, id: string }): void {
            const i = state.teamInfos.findIndex(l => l.id == payload.id);
            if (i > -1) state.teamInfos[i].isHiddenByAdmin = payload.isHiddenByAdmin;
            if (state.selfTeamInfo?.id == payload.id) state.selfTeamInfo.isHiddenByAdmin = payload.isHiddenByAdmin;
        },
    },
    getters: {
        filteredTeamInfos: (state): TeamInfo[] => {
            let teamInfos = state.teamInfos;

            if (state.filterValue.length) {
                teamInfos = teamInfos.filter(l => {
                    let trigger;

                    if (l.user.username.toLowerCase().includes(state.filterValue.toLowerCase())) trigger = true;
                    if (l.user.osuId.toString().includes(state.filterValue)) trigger = true;
                    if (l.languages.includes(state.filterValue.toLowerCase())) trigger = true;

                    return trigger;
                });
            }

            if (state.roleIs && state.roleIs !== 'any') {
                teamInfos = teamInfos.filter(l => l.roles.includes(state.roleIs));
            }

            return teamInfos;
        },
    },
    actions: {
        updateFilterValue ({ commit }, value: string): void {
            commit('setFilterValue', value);
        },
        updateRole ({ commit, state }, roleIs): void {
            if (state.roleIs !== roleIs) {
                commit('setRoleIs', roleIs);
            }
        },
    },
};

export default store;
