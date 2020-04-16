import Vue from 'vue';
import Vuex from 'vuex';
import QuestPage from '../pages/admin/QuestPage.vue';
import '../bootstrap';
import mixins from '../mixins';
import toastsModule from '../modules/toasts';
import { Quest } from '../../interfaces/quest';

Vue.mixin(mixins);
Vue.use(Vuex);

interface QuestState {
    quests: Quest[];
}

const store = new Vuex.Store<QuestState>({
    modules: {
        toasts: toastsModule,
    },
    state: {
        quests: [],
    },
    mutations: {
        setQuests (state, quests: Quest[]): void {
            state.quests = quests;
        },
        updateQuest (state, quest: Quest): void {
            const i = state.quests.findIndex(q => q.id === quest.id);
            if (i !== -1) Vue.set(state.quests, i, quest);
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
    },
    strict: process.env.NODE_ENV !== 'production',
});

new Vue({
    el: '#app',
    store,
    components: {
        QuestPage,
    },
});
