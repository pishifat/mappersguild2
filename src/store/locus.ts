import { Module } from 'vuex';
import { LocusInfo } from '@interfaces/locusInfo';
import { MainState } from './main';

interface LocusState {
    filterValue: string;
    locusInfos: LocusInfo[];
    selfLocusInfo: LocusInfo | null;
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
        updateTimezone (state, timezone: string): void {
            state.selfLocusInfo.timezone = timezone;
        },
        updateAvailability (state, availability: string): void {
            state.selfLocusInfo.availability = availability;
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
        },
        updateDiscord (state, discord: string): void {
            state.selfLocusInfo.discord = discord;
        },
        updateEmail (state, email: string): void {
            state.selfLocusInfo.email = email;
        },
        updateAbout (state, about: string): void {
            state.selfLocusInfo.about = about;
        },
        updateIsPublic (state, isPublic: boolean): void {
            state.selfLocusInfo.isPublic = isPublic;
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
                    if (l.about.includes(state.filterValue.toLowerCase())) trigger = true;
                    if (l.timezone.includes(state.filterValue.toLowerCase())) trigger = true;

                    return trigger;
                });
            }

            return locusInfos;
        },
    },
    actions: {
        updateFilterValue ({ commit }, value: string): void {
            commit('setFilterValue', value);
        },
    },
};

export default store;
