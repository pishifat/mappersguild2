import Vue from 'vue';
import Vuex from 'vuex';
import ShowcasePage from './pages/ShowcasePage.vue';
import './bootstrap.ts';
import { Beatmap } from '../interfaces/beatmap/beatmap';
import { User, UserGroup } from '../interfaces/user';
import { TaskName } from '../interfaces/beatmap/task';
import mixins from './mixins';
import toastsModule from './modules/toasts';

Vue.mixin(mixins);
Vue.use(Vuex);

const store = new Vuex.Store({
    modules: {
        toasts: toastsModule,
    },
    state: {
        userId: null as null | User['id'],
        userOsuId: null as null | User['osuId'],
        username: '' as User['username'],
        userGroup: null as null | UserGroup,
        showcaseBeatmaps: [] as Beatmap[],
        selectedBeatmap: null as null | Beatmap,
        selectedBeatmapId: null as null | string,
        isShowcase: true,
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
        setShowcaseBeatmaps (state, beatmaps: Beatmap[]): void {
            state.showcaseBeatmaps = beatmaps;
        },
        setSelectedBeatmap (state, beatmap: Beatmap): void {
            const sortOrder = Object.values(TaskName);

            beatmap.tasks.sort(function(a, b) {
                return sortOrder.indexOf(a.name) - sortOrder.indexOf(b.name);
            });

            beatmap.tasksLocked.sort(function(a, b) {
                return sortOrder.indexOf(a) - sortOrder.indexOf(b);
            });

            state.selectedBeatmap = beatmap;
        },
        addBeatmap (state, beatmap: Beatmap): void {
            state.showcaseBeatmaps.unshift(beatmap);
        },
        updateBeatmap (state, beatmap: Beatmap): void {
            let i = state.showcaseBeatmaps.findIndex(b => b.id === beatmap.id);
            if (i !== -1) Vue.set(state.showcaseBeatmaps, i, beatmap);

            i = state.showcaseBeatmaps.findIndex(b => b.id === beatmap.id);
            if (i !== -1) Vue.set(state.showcaseBeatmaps, i, beatmap);
        },
        deleteBeatmap (state, beatmap: Beatmap): void {
            let i = state.showcaseBeatmaps.findIndex(b => b.id === beatmap.id);
            if (i !== -1) state.showcaseBeatmaps.splice(i, 1);

            i = state.showcaseBeatmaps.findIndex(b => b.id === beatmap.id);
            if (i !== -1) state.showcaseBeatmaps.splice(i, 1);
        },
    },
    actions: {
        updateBeatmap ({ commit, state }, beatmap: Beatmap): void {
            commit('updateBeatmap', beatmap);

            if (state.selectedBeatmap?.id === beatmap.id) {
                commit('setSelectedBeatmap', beatmap);
            }
        },
    },
    strict: process.env.NODE_ENV !== 'production',
});

new Vue({
    el: '#app',
    store,
    components: {
        ShowcasePage,
    },
});