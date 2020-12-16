import { ActionTree } from 'vuex';
import { Quest } from '@interfaces/quest';
import { QuestPageOnLoad, QuestsSearch } from '@interfaces/api/quests';
import { QuestsState } from './index';
import { http, isError } from '@store/http';
import { FilterMode } from '@interfaces/extras';

const actions: ActionTree<QuestsState, any> | undefined = {
    updateQuest ({ commit }, quest: Quest): void {
        commit('updateQuest', quest);
    },

    setQuests ({ commit }, quests: Quest[]): void {
        commit('setQuests', quests);
    },

    updateFilterValue ({ commit }, value: string): void {
        commit('setFilterValue', value);
    },

    async loadQuests ({ commit }, id?: string): Promise<void> {
        let url = `/quests/relevantInfo`;
        if (id) url += `?id=${id}`;
        const res = await http.initialRequest<QuestPageOnLoad>(url);

        if (!isError(res)) {
            commit('setQuests', res.quests);
            commit('setFilterMode', res.mainMode);

            if (id) {
                commit('setSelectedQuestId', id);
            }
        }
    },

    async searchQuests ({ commit, state }, mode?: FilterMode): Promise<void> {
        if (mode) commit('setFilterMode', mode);
        commit('setIsLoadingQuests', true);

        const res = await http.executeGet<QuestsSearch>(`/quests/search?mode=${state.filterMode}`);

        if (!isError(res)) {
            commit('setQuests', res.quests);
        }

        commit('setIsLoadingQuests', false);
    },
};

export default actions;