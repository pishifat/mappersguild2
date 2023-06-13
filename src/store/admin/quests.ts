import { Module } from 'vuex';
import { MainState } from '@store/main';
import { Quest } from '../../../interfaces/quest';

interface QuestState {
    quests: Quest[];
    exampleQuest: Quest | null;
}

const store: Module<QuestState, MainState> = {
    state: {
        quests: [],
        exampleQuest: null,
    },
    mutations: {
        setQuests (state, quests: Quest[]): void {
            state.quests = quests;
        },
        setExampleQuest (state, exampleQuest) {
            state.exampleQuest = exampleQuest;
        },
        updateQuest (state, quest: Quest): void {
            const i = state.quests.findIndex(q => q.id === quest.id);
            if (i !== -1) state.quests[i] = quest;
        },
        addQuest (state, quest: Quest): void {
            state.quests.push(quest);
        },
        deleteQuest (state, quest: Quest): void {
            const i = state.quests.findIndex(q => q.id === quest.id);
            state.quests.splice(i, 1);
        },
        renameQuest (state, payload): void {
            const quest = state.quests.find(q => q.id == payload.questId);

            if (quest) {
                quest.name = payload.name;
            }
        },
        updatePrice (state, payload): void {
            const quest = state.quests.find(q => q.id == payload.questId);

            if (quest) {
                quest.price = payload.price;
            }
        },
        updateRequiredMapsets (state, payload): void {
            const quest = state.quests.find(q => q.id == payload.questId);

            if (quest) {
                quest.requiredMapsets = payload.requiredMapsets;
            }
        },
        updateDescription (state, payload): void {
            const quest = state.quests.find(q => q.id == payload.questId);

            if (quest) {
                quest.descriptionMain = payload.description;
            }
        },
        resetQuestDeadline (state, payload): void {
            const quest = state.quests.find(q => q.id == payload.questId);

            if (quest) {
                quest.deadline = payload.deadline;
            }
        },
        updateExpiration (state, payload): void {
            const quest = state.quests.find(q => q.id == payload.questId);

            if (quest) {
                quest.expiration = payload.expiration;
            }
        },
        updateMinParty (state, payload): void {
            const quest = state.quests.find(q => q.id == payload.questId);

            if (quest) {
                quest.minParty = payload.minParty;
            }
        },
        updateMaxParty (state, payload): void {
            const quest = state.quests.find(q => q.id == payload.questId);

            if (quest) {
                quest.maxParty = payload.maxParty;
            }
        },
    },
};

export default store;
