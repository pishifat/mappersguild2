import { ActionTree } from 'vuex';
import { Quest } from '@interfaces/quest';
import { QuestsState } from './index';
import { http, isError } from '@store/http';
import { Party } from '@interfaces/party';
import { MainState } from '@store/main';

const actions: ActionTree<QuestsState, MainState> | undefined = {
    updateQuest ({ commit }, quest: Quest): void {
        commit('updateQuest', quest);
    },

    updateParty ({ commit }, party: Party): void {
        commit('updateParty', party);
    },

    setQuests ({ commit }, quests: Quest[]): void {
        commit('setQuests', quests);
    },

    updateFilterValue ({ commit }, value: string): void {
        commit('setFilterValue', value);
    },

    updateFilterMode ({ commit }, value: string): void {
        commit('setFilterMode', value);
    },

    updateFilterArtist ({ commit }, value: string): void {
        commit('setFilterArtist', value);
    },

    async loadQuests ({ commit, rootState }, id?: string): Promise<void> {
        const mainMode = rootState.loggedInUser?.mainMode;
        let url = `/quests/search?mode=${mainMode}&limit=${100}`;
        if (id) url += `&id=${id}`;

        const quests = await http.initialRequest<Quest[]>(url);

        if (!isError(quests)) {
            commit('setQuests', quests);
            commit('setFilterMode', mainMode);
            commit('setIsLoadingQuests', false);

            if (id) {
                commit('setSelectedQuestId', id);
            }
        }
    },
    async searchQuests ({ commit, state }, all?: boolean): Promise<void> {
        commit('setIsLoadingQuests', true);

        let limit = 100;

        if (all) {
            limit = 10000;
            commit('setFilterArtist', '');
        }

        const quests = await http.executeGet<Quest[]>(`/quests/search?mode=${state.filterMode}&artist=${state.filterArtist}&limit=${limit}`);

        if (!isError(quests)) {
            commit('setQuests', quests);
        }

        commit('setIsLoadingQuests', false);
    },
};

export default actions;