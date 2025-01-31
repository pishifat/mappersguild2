import { Module } from 'vuex';
import { LocusInfo } from '@interfaces/locusInfo';
import { MainState } from './main';
import Vue from 'vue';

interface LocusState {
    filterValue: string;
    locusInfos: LocusInfo[];
    selfLocusInfo: LocusInfo | null;
    roleIs: 'any' | 'visual designer' | 'mapper' | 'musician';
}

const store: Module<LocusState, MainState> = {
    namespaced: true,
    state: {
        filterValue: '',
        locusInfos: [],
        selfLocusInfo: null,
    },
    mutations: {
        setFilterValue (state, filterValue: string): void {
            state.filterValue = filterValue;
        },
        setLocusInfos (state, locusInfos: LocusInfo[]): void {
            state.locusInfos = locusInfos;
        },
        setSelfLocusInfo (state, selfLocusInfo: LocusInfo): void {
            state.selfLocusInfo = selfLocusInfo;
        },
        setRoleIs (state, roleIs: 'any' | 'visual designer' | 'mapper' | 'musician'): void {
            state.roleIs = roleIs;
        },
        updateTimezone (state, timezone: string): void {
            state.selfLocusInfo.timezone = timezone;
            this.commit('locus/updateSelfInListing');
        },
        updateAvailability (state, availability: string): void {
            state.selfLocusInfo.availability = availability;
            this.commit('locus/updateSelfInListing');
        },
        updateLanguage (state, language: string): void {
            if (state.selfLocusInfo.languages && state.selfLocusInfo.languages.length) {
                const i = state.selfLocusInfo.languages.findIndex(l => l == language);

                if (i > -1) {
                    state.selfLocusInfo.languages.splice(i, 1);
                } else {
                    state.selfLocusInfo.languages.push(language);
                }
            } else {
                state.selfLocusInfo.languages = [language];
            }

            this.commit('locus/updateSelfInListing');
        },
        updateRole (state, role: string): void {
            if (state.selfLocusInfo.roles && state.selfLocusInfo.roles.length) {
                const i = state.selfLocusInfo.roles.findIndex(r => r == role);

                if (i > -1) {
                    state.selfLocusInfo.roles.splice(i, 1);
                } else {
                    state.selfLocusInfo.roles.push(role);
                }
            } else {
                state.selfLocusInfo.roles = [role];
            }

            this.commit('locus/updateSelfInListing');
        },
        updateDiscord (state, discord: string): void {
            state.selfLocusInfo.discord = discord;
            this.commit('locus/updateSelfInListing');
        },
        updateEmail (state, email: string): void {
            state.selfLocusInfo.email = email;
            this.commit('locus/updateSelfInListing');
        },
        updateAbout (state, about: string): void {
            state.selfLocusInfo.about = about;
            this.commit('locus/updateSelfInListing');
        },
        updateIsPublic (state, isPublic: boolean): void {
            state.selfLocusInfo.isPublic = isPublic;
            this.commit('locus/updateSelfInListing');
        },
        updateIsOnTeam (state, isOnTeam: boolean): void {
            state.selfLocusInfo.isOnTeam = isOnTeam;
            this.commit('locus/updateSelfInListing');
        },
        adminUpdateIsOnTeam (state, payload: { isOnTeam: boolean, id: string }): void {
            const i = state.locusInfos.findIndex(l => l.id == payload.id);
            state.locusInfos[i].isOnTeam = payload.isOnTeam;
        },
        updateSelfInListing (state): void {
            const i = state.locusInfos.findIndex(l => l.id == state.selfLocusInfo.id);
            state.locusInfos[i] = state.selfLocusInfo;
        },
    },
    getters: {
        filteredLocusInfos: (state): LocusInfo[] => {
            let locusInfos = state.locusInfos;

            if (state.filterValue.length) {
                locusInfos = locusInfos.filter(l => {
                    let trigger;

                    if (l.user.username.toLowerCase().includes(state.filterValue.toLowerCase())) trigger = true;
                    if (l.user.osuId.toString().includes(state.filterValue)) trigger = true;
                    if (l.languages.includes(state.filterValue.toLowerCase())) trigger = true;
                    // if (l.about.includes(state.filterValue.toLowerCase())) trigger = true;
                    // if (l.timezone.includes(state.filterValue.toLowerCase())) trigger = true;

                    return trigger;
                });
            }

            if (state.roleIs && state.roleIs !== 'any') {
                locusInfos = locusInfos.filter(l => l.roles.includes(state.roleIs));
            }

            return locusInfos;
        },
    },
    actions: {
        updateFilterValue ({ commit }, value: string): void {
            commit('setFilterValue', value);
        },
        updateRole ({ commit, state }, roleIs): void {
            if (roleIs == 'designer') roleIs = 'visual designer';

            if (state.roleIs !== roleIs) {
                commit('setRoleIs', roleIs);
            }
        },
    },
};

export default store;
