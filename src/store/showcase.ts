import Vue from 'vue';
import { Beatmap } from '@interfaces/beatmap/beatmap';
import { TaskName } from '@interfaces/beatmap/task';
import { Module } from 'vuex';

interface ShowcaseState {
    showcaseBeatmaps: Beatmap[],
    selectedBeatmap: null | Beatmap,
    selectedBeatmapId: null | string,
    isShowcase: boolean,
}

const store: Module<ShowcaseState, any> = {
    namespaced: true,
    state: {
        showcaseBeatmaps: [],
        selectedBeatmap: null,
        selectedBeatmapId: null,
        isShowcase: true,
    },
    mutations: {
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
};

export default store;
