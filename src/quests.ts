import Vue from 'vue';
import Vuex from 'vuex';
import Axios from 'axios';
import QuestPage from '@pages/quests/QuestPage.vue';
import './bootstrap.ts';
import mixins from './mixins';
import { User, UserGroup } from '../interfaces/user';
import { Quest, QuestStatus } from '../interfaces/quest';
import { FilterMode } from '../interfaces/extras';
import toastsModule from './modules/toasts';

Vue.mixin(mixins);
Vue.use(Vuex);

const store = new Vuex.Store({
    modules: {
        toasts: toastsModule,
    },
    state: {
        userId: null as null | User['id'],
        userGroup: null as null | UserGroup,
        quests: [] as Quest[],
        filterValue: '',
        filterMode: 'any' as FilterMode,
        isLoadingQuests: true,
        availablePoints: null as null | User['availablePoints'],
    },
    mutations: {
        setUserId (state, id: User['id']): void {
            state.userId = id;
        },
        setUserGroup (state, group: UserGroup): void {
            state.userGroup = group;
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
        setAvailablePoints (state, value: User['availablePoints']): void {
            state.availablePoints = value;
        },
        updateQuest (state, quest: Quest): void {
            const i = state.quests.findIndex(q => q.id === quest.id);
            if (i !== -1) Vue.set(state.quests, i, quest);
        },
    },
    getters: {
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
        availablePoints: (state): number => {
            if (state.availablePoints) return state.availablePoints;
            else return 0;
        },
    },
    actions: {
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
    strict: process.env.NODE_ENV !== 'production',
});

new Vue({
    el: '#app',
    store,
    components: {
        QuestPage,
    },
});
