import Vue from 'vue';
import { Module } from 'vuex';
import { Quest, QuestStatus } from '@interfaces/quest';
import { FilterMode } from '@interfaces/extras';
import actions from './actions';

export interface QuestsState {
    quests: Quest[];
    filterValue: string;
    filterMode: FilterMode;
    isLoadingQuests: boolean;
    selectedQuestId: null | string;
    isFirstLoadDone: boolean;
}

const store: Module<QuestsState, any> = {
    namespaced: true,
    state: {
        quests: [],
        filterValue: '',
        filterMode: FilterMode.any,
        isLoadingQuests: true,
        selectedQuestId: null,
        isFirstLoadDone: false,
    },
    mutations: {
        setFirstLoadDone (state): void {
            state.isFirstLoadDone = true;
        },
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
        setSelectedQuestId (state, questId: string): void {
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
    actions,
};

export default store;
