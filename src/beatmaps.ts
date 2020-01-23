import Vue from 'vue';
import Vuex from 'vuex';
import Axios from 'axios';
import BeatmapPage from './pages/beatmaps/BeatmapPage.vue';
import './bootstrap.ts';
import { Beatmap, BeatmapMode } from '@models/beatmap';
import { User, UserGroup } from '@models/user';
import { BeatmapStatus } from '@models/beatmap';
import { FilterMode } from '@models/extras';
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
        filterStatus: 'any' as BeatmapStatus | 'any',
        filterQuest: 'any' as 'none' | 'any',
        selectedBeatmap: null as null | Beatmap,
        fetchLimit: 30,
        isLoadingOtherBeatmaps: true,
        toastMessages: [] as string[],
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
        setFilterStatus (state, status: BeatmapStatus | 'any'): void {
            state.filterStatus = status;
        },
        setFilterQuest (state, quest: 'any' | 'none'): void {
            state.filterQuest = quest;
        },
        setIsLoadingOtherBeatmaps (state, value: boolean): void {
            state.isLoadingOtherBeatmaps = value;
        },
        addToastMessage (state, message: string): void {
            state.toastMessages.push(message);
        },
        removeFirstToastMessage (state): void {
            state.toastMessages.splice(0, 1);
        },
        increaseFetchLimit (state): void {
            state.fetchLimit += 50;
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
        filteredUserBeatmaps: (state): Beatmap[] => {
            let beatmaps = state.userBeatmaps;

            if (state.filterMode !== FilterMode.any) {
                const mode = state.filterMode as string;
                beatmaps = beatmaps.filter(b => b.mode === mode || b.mode === BeatmapMode.Hybrid);
            }

            if (state.filterStatus !== 'any') {
                beatmaps = beatmaps.filter(b => b.status === state.filterStatus);
            }

            if (state.filterQuest !== 'any') {
                beatmaps = beatmaps.filter(b => !b.quest);
            }

            if (state.filterValue) {
                const tags = state.filterValue
                    .toLowerCase()
                    .trim()
                    .split(' ')
                    .filter(t => t.length);

                beatmaps = beatmaps.filter(b => {
                    let searchableTags = b.song.artist + ' ' + b.song.title + ' ' + b.host.username;
                    b.tasks.forEach(task => {
                        task.mappers.forEach(mapper => {
                            searchableTags += ' ' + mapper.username;
                        });
                    });

                    searchableTags = searchableTags.toLowerCase();

                    return tags.some(t => searchableTags.includes(t));
                });
            }

            return beatmaps;
        },
        guestDifficultyBeatmaps: (state, getters): Beatmap[] => {
            return getters.filteredUserBeatmaps.filter(b => b.host.id !== state.userId);
        },
        hostedBeatmaps: (state, getters): Beatmap[] => {
            return getters.filteredUserBeatmaps.filter(b => b.host.id === state.userId);
        },
    },
    actions: {
        updateBeatmap ({ commit, state }, beatmap: Beatmap): void {
            commit('updateBeatmap', beatmap);

            if (state.selectedBeatmap?.id === beatmap.id) {
                commit('setSelectedBeatmap', beatmap);
            }
        },
        async updateFilterMode ({ commit, dispatch }, mode: string): Promise<void> {
            commit('setFilterMode', mode);
            await dispatch('loadOthersBeatmaps');
        },
        async updateFilterStatus ({ commit, dispatch }, status: string): Promise<void> {
            commit('setFilterStatus', status);
            await dispatch('loadOthersBeatmaps');
        },
        async updateFilterQuest ({ commit, dispatch }, quest: string): Promise<void> {
            commit('setFilterQuest', quest);
            await dispatch('loadOthersBeatmaps');
        },
        async updateFilterValue ({ commit, dispatch }, value: string): Promise<void> {
            commit('setFilterValue', value);
            await dispatch('loadOthersBeatmaps');
        },
        async loadOthersBeatmaps ({ commit, state }): Promise<void> {
            commit('setIsLoadingOtherBeatmaps', true);

            const status = state.filterStatus !== 'any' ? `&status=${state.filterStatus}` : '';
            const quest = state.filterQuest !== 'any' ? `&quest=${state.filterQuest}` : '';
            const search = state.filterValue ? `&search=${state.filterValue}` : '';

            const response = await Axios.get(`/beatmaps/search?mode=${state.filterMode}&limit=${state.fetchLimit + status + quest + search}`);

            if (response.data?.allBeatmaps) {
                commit('setAllBeatmaps', response.data.allBeatmaps);
            }

            commit('setIsLoadingOtherBeatmaps', false);
        },
        updateToastMessages ({ commit }, message: string): void {
            commit('addToastMessage', message);

            setTimeout(() => {
                commit('removeFirstToastMessage');
            }, 5000);
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
