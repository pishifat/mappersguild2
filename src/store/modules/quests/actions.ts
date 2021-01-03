import { ActionTree } from 'vuex';
import { Quest, QuestStatus } from '@interfaces/quest';
import { QuestsState } from './index';
import { http, isError } from '@store/http';
import { FilterMode } from '@interfaces/extras';
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

    async loadQuests ({ commit, rootState }, id?: string): Promise<void> {
        const mainMode = rootState.loggedInUser?.mainMode;
        let url = `/quests/search?mode=${mainMode}&status=${QuestStatus.Open}`;
        if (id) url += `&id=${id}`;
        const quests = await http.initialRequest<Quest[]>(url);

        if (!isError(quests)) {
            commit('setQuests', quests);
            commit('setFilterMode', mainMode);

            if (id) {
                commit('setSelectedQuestId', id);
            }
        }
    },

    async searchQuests ({ commit, state }, mode?: FilterMode): Promise<void> {
        if (mode) commit('setFilterMode', mode);
        commit('setIsLoadingQuests', true);

        const quests = await http.executeGet<Quest[]>(`/quests/search?mode=${state.filterMode}`);

        if (!isError(quests)) {
            commit('setQuests', quests);
        }

        commit('setIsLoadingQuests', false);
    },
};

export default actions;