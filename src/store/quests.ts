import Vue from 'vue';
import Axios from 'axios';
import { Quest, QuestStatus } from '../../interfaces/quest';
import { FilterMode } from '../../interfaces/extras';
import { Module } from 'vuex';

interface QuestsState {
    quests: Quest[];
    filterValue: string;
    filterMode: FilterMode;
    isLoadingQuests: boolean;
    selectedQuestId: null | string,
}

const store: Module<QuestsState, any> = {
    state: {
        quests: [],
        filterValue: '',
        filterMode: FilterMode.any,
        isLoadingQuests: true,
        selectedQuestId: null,
    },
    mutations: {
        setQuests (state, quests: Quest[]): void {
            state.quests = quests;
        },
        setFilterValue (state, value: string): void {
            state.filterValue = value;
        },
        setFilterMode (state, mode: FilterMode): void {
            state.filterMode = mode;
        },
        setIsLoadingQuests (state, value: boolean): void {
            state.isLoadingQuests = value;
        },
        setSelectedQuest (state, questId: string): void {
            state.selectedQuestId = questId;
        },
        updateQuest (state, quest: Quest): void {
            const i = state.quests.findIndex(q => q.id === quest.id);
            if (i !== -1) Vue.set(state.quests, i, quest);
        },
    },
    getters: {
        selectedQuest: (state): Quest | undefined => {
            return state.quests.find(q => q.id === state.selectedQuestId);
        },
        filteredQuests: (state): Quest[] => {
            let quests = state.quests;

            if (state.filterMode !== FilterMode.any) {
                const mode = state.filterMode;
                quests = quests.filter(q => q.modes.includes(mode));
            }

            if (state.filterValue.length > 2) {
                quests = quests.filter(q => {
                    return q.name.toLowerCase().includes(state.filterValue.toLowerCase());
                });
            }

            return quests;
        },
        openQuests: (state, getters): Quest[] => {
            return getters.filteredQuests.filter(q => q.status == QuestStatus.Open && !q.isExpired);
        },
        wipQuests: (state, getters): Quest[] => {
            return getters.filteredQuests.filter(q => q.status == QuestStatus.WIP);
        },
        completeQuests: (state, getters): Quest[] => {
            return getters.filteredQuests.filter(q => q.status == QuestStatus.Done);
        },
        expiredQuests: (state, getters): Quest[] => {
            return getters.filteredQuests.filter(q => q.isExpired);
        },
    },
    actions: {
        updateQuest ({ commit }, quest: Quest): void {
            commit('updateQuest', quest);
        },
        setQuests ({ commit }, quests: Quest[]): void {
            commit('setQuests', quests);
        },
        async updateFilterMode ({ commit }, mode: string): Promise<void> {
            commit('setIsLoadingQuests', true);

            const response = await Axios.get(`/quests/search?mode=${mode}`);

            if (response.data?.quests && !response.data?.quests.error) {
                commit('setQuests', response.data.quests);
                commit('setFilterMode', mode);
            }

            commit('setIsLoadingQuests', false);
        },
        updateFilterValue ({ commit }, value: string): void {
            commit('setFilterValue', value);
        },
        async loadQuests ({ commit, state }): Promise<void> {
            commit('setIsLoadingQuests', true);

            const response = await Axios.get(`/quests/search?mode=${state.filterMode}`);

            if (response.data?.quests && !response.data?.quests.error) {
                commit('setQuests', response.data.quests);
            }

            commit('setIsLoadingQuests', false);
        },
    },
};

export default store;
