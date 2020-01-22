import Vue from 'vue';
import Vuex from 'vuex';
import BeatmapPage from './pages/beatmaps/BeatmapPage.vue';
import './bootstrap.ts';
import { Beatmap } from './models/beatmap';
import { User, UserGroup } from './models/user';
import { BeatmapStatus } from '../models/beatmap/beatmap';
import { FilterMode } from './models/extras';
import mixins from './mixins';

Vue.mixin(mixins);
Vue.use(Vuex);

const store = new Vuex.Store({
    state: {
        userId: null as null | User['id'],
        userOsuId: null as null | User['osuId'],
        username: '' as User['username'],
        userGroup: null as null | UserGroup,
        allBeatmaps: [] as Beatmap[],
        userBeatmaps: [] as Beatmap[],
        filterValue: '',
        filterMode: 'any' as FilterMode,
        filterStatus: '' as BeatmapStatus | 'any',
        filterQuest: '' as 'none' | 'any',
        selectedBeatmap: null as null | Beatmap,
    },
    mutations: {
        setUserId (state, id: User['id']): void {
            state.userId = id;
        },
        setUserOsuId (state, id: User['osuId']): void {
            state.userOsuId = id;
        },
        setUsername (state, username: User['username']): void {
            state.username = username;
        },
        setUserGroup (state, group: UserGroup): void {
            state.userGroup = group;
        },
        setAllBeatmaps (state, beatmaps: Beatmap[]): void {
            state.allBeatmaps = beatmaps;
        },
        setUserBeatmaps (state, beatmaps: Beatmap[]): void {
            state.userBeatmaps = beatmaps;
        },
        setFilterValue (state, value: string): void {
            state.filterValue = value;
        },
        setFilterMode (state, mode: FilterMode): void {
            state.filterMode = mode;
        },
        setFilterStatus (state, status: BeatmapStatus): void {
            state.filterStatus = status;
        },
        setFilterQuest (state, quest: 'any' | 'none'): void {
            state.filterQuest = quest;
        },
        setSelectedBeatmap (state, beatmap: Beatmap): void {
            const sortOrder = ['Easy', 'Normal', 'Hard', 'Insane', 'Expert', 'Storyboard'];

            beatmap.tasks.sort(function(a, b) {
                return sortOrder.indexOf(a.name) - sortOrder.indexOf(b.name);
            });

            beatmap.tasksLocked.sort(function(a, b) {
                return sortOrder.indexOf(a) - sortOrder.indexOf(b);
            });

            state.selectedBeatmap = beatmap;
        },
        addBeatmap (state, beatmap: Beatmap): void {
            state.userBeatmaps.unshift(beatmap);
        },
        updateBeatmap (state, beatmap: Beatmap): void {
            let i = state.allBeatmaps.findIndex(b => b.id === beatmap.id);
            if (i !== -1) Vue.set(state.allBeatmaps, i, beatmap);

            i = state.userBeatmaps.findIndex(b => b.id === beatmap.id);
            if (i !== -1) Vue.set(state.userBeatmaps, i, beatmap);
        },
        deleteBeatmap (state, beatmap: Beatmap): void {
            let i = state.allBeatmaps.findIndex(b => b.id === beatmap.id);
            if (i !== -1) state.allBeatmaps.splice(i, 1);

            i = state.userBeatmaps.findIndex(b => b.id === beatmap.id);
            if (i !== -1) state.userBeatmaps.splice(i, 1);
        },
    },
    getters: {
        guestDifficultyBeatmaps: (state): Beatmap[] => {
            return state.userBeatmaps.filter(b => b.host.id !== state.userId);
        },
        hostedBeatmaps: (state): Beatmap[] => {
            return state.userBeatmaps.filter(b => b.host.id === state.userId);
        },
        isHost: (state): boolean => {
            if (state.userOsuId && state.selectedBeatmap) {
                return state.userOsuId === state.selectedBeatmap.host.osuId;
            }

            return false;
        },
        isRanked: (state): boolean => {
            return state.selectedBeatmap?.status === 'Ranked';
        },
        isQualified: (state): boolean => {
            return state.selectedBeatmap?.status === 'Qualified';
        },
    },
    actions: {
        updateBeatmap ({ commit }, beatmap: Beatmap): void {
            commit('updateBeatmap', beatmap);
            commit('setSelectedBeatmap', beatmap);
        },
    },
    strict: process.env.NODE_ENV !== 'production',
});

new Vue({
    el: '#app',
    store,
    components: {
        BeatmapPage,
    },
});
