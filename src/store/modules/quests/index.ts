import { Module } from 'vuex';
import actions from './actions';
import { Quest, QuestStatus } from '@interfaces/quest';
import { FilterMode } from '@interfaces/extras';
import { Party } from '@interfaces/party';
import { MainState } from '@store/main';

export interface QuestsState {
    quests: Quest[];
    filterValue: string;
    filterMode: FilterMode;
    filterArtist: string;
    isLoadingQuests: boolean;
    selectedQuestId: null | string;
    isFirstLoadDone: boolean;
}

const store: Module<QuestsState, MainState> = {
    namespaced: true,
    state: {
        quests: [],
        filterValue: '',
        filterMode: FilterMode.any,
        filterArtist: '',
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
        setFilterArtist (state, artist: string): void {
            state.filterArtist = artist;
        },
        setIsLoadingQuests (state, value: boolean): void {
            state.isLoadingQuests = value;
        },
        setSelectedQuestId (state, questId: string): void {
            state.selectedQuestId = questId;
        },
        updateQuest (state, quest: Quest): void {
            const i = state.quests.findIndex(q => q.id === quest.id);
            if (i !== -1) state.quests[i] = quest;
        },
        updateParty (state, party: Party): void {
            const questIndex = state.quests.findIndex(q => q.id === state.selectedQuestId);

            if (questIndex !== -1) {
                const partyIndex = state.quests[questIndex].parties.findIndex(p => p.id === party.id);

                if (partyIndex !== -1) state.quests[questIndex].parties[partyIndex] = party;
            }
        },
    },
    getters: {
        selectedQuest: (state): Quest | undefined => {
            if (!state.selectedQuestId) return undefined;

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
            return getters.filteredQuests.filter(q => q.status == QuestStatus.Open);
        },
        wipQuests: (state, getters): Quest[] => {
            return getters.filteredQuests.filter(q => q.status == QuestStatus.WIP);
        },
        completeQuests: (state, getters): Quest[] => {
            return getters.filteredQuests.filter(q => q.status == QuestStatus.Done);
        },
    },
    actions,
};

export default store;
