import { Module } from 'vuex';
import Axios from 'axios';
import { Beatmap, BeatmapMode, BeatmapStatus } from '../../interfaces/beatmap/beatmap';
import { FilterMode } from '../../interfaces/extras';
import { TaskName } from '../../interfaces/beatmap/task';
import { MainState } from './main';

interface BeatmapsState {
    allBeatmaps: Beatmap[];
    userBeatmaps: Beatmap[];
    filterValue: string;
    filterMode: FilterMode;
    filterStatus: BeatmapStatus | 'any';
    filterQuest: 'none' | 'any';
    selectedBeatmap: null | Beatmap;
    selectedBeatmapId: null | string;
    fetchLimit: number;
    isLoadingOtherBeatmaps: boolean;
}

const store: Module<BeatmapsState, MainState> = {
    namespaced: true,
    state: {
        allBeatmaps: [],
        userBeatmaps: [],
        filterValue: '',
        filterMode: FilterMode.any,
        filterStatus: 'any',
        filterQuest: 'any',
        selectedBeatmap: null,
        selectedBeatmapId: null,
        fetchLimit: 30,
        isLoadingOtherBeatmaps: true,
    },
    mutations: {
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
        increaseFetchLimit (state): void {
            state.fetchLimit += 50;
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
            state.userBeatmaps.unshift(beatmap);
        },
        updateBeatmap (state, beatmap: Beatmap): void {
            let i = state.allBeatmaps.findIndex(b => b.id === beatmap.id);
            if (i !== -1) state.allBeatmaps[i] = beatmap;

            i = state.userBeatmaps.findIndex(b => b.id === beatmap.id);
            if (i !== -1) state.userBeatmaps[i] = beatmap;
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
                    let searchableTags = b.song.artist + ' ' + b.song.title + ' ' + b.host.username + ' ' + b.url;
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
        guestDifficultyBeatmaps: (state, getters, rootState): Beatmap[] => {
            return getters.filteredUserBeatmaps.filter(b => b.host.id !== rootState.loggedInUser?.id);
        },
        hostedBeatmaps: (state, getters, rootState): Beatmap[] => {
            return getters.filteredUserBeatmaps.filter(b => b.host.id === rootState.loggedInUser?.id);
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
            await dispatch('loadOtherBeatmaps');
        },
        async updateFilterStatus ({ commit, dispatch }, status: string): Promise<void> {
            commit('setFilterStatus', status);
            await dispatch('loadOtherBeatmaps');
        },
        async updateFilterQuest ({ commit, dispatch }, quest: string): Promise<void> {
            commit('setFilterQuest', quest);
            await dispatch('loadOtherBeatmaps');
        },
        async updateFilterValue ({ commit, dispatch }, value: string): Promise<void> {
            commit('setFilterValue', value);
            await dispatch('loadOtherBeatmaps');
        },
        async loadOtherBeatmaps ({ commit, state }): Promise<void> {
            commit('setIsLoadingOtherBeatmaps', true);

            const status = state.filterStatus !== 'any' ? `&status=${state.filterStatus}` : '';
            const quest = state.filterQuest !== 'any' ? `&quest=${state.filterQuest}` : '';
            const search = state.filterValue ? `&search=${state.filterValue}` : '';

            const response = await Axios.get(`/api/beatmaps/search?mode=${state.filterMode}&limit=${state.fetchLimit + status + quest + search}`);

            if (response.data?.allBeatmaps) {
                commit('setAllBeatmaps', response.data.allBeatmaps);
            }

            commit('setIsLoadingOtherBeatmaps', false);
        },
    },
};

export default store;
