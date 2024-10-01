import { Module } from 'vuex';
import { Beatmap } from '@interfaces/beatmap/beatmap';
import { MainState } from './main';

interface WorldCupState {
    beatmaps: Beatmap[];
    selectedBeatmap: null | Beatmap;
}

const store: Module<WorldCupState, MainState> = {
    namespaced: true,
    state: {
        beatmaps: [],
        selectedBeatmap: null,
    },
    mutations: {
        setBeatmaps (state, beatmaps: Beatmap[]): void {
            state.beatmaps = beatmaps;
            state.selectedBeatmap = beatmaps[0];
        },
        setSelectedBeatmap (state, beatmap: Beatmap): void {
            state.selectedBeatmap = beatmap;
        },
    },
    getters: {
        osuBeatmaps: (state): Beatmap[] => {
            return state.beatmaps.filter(b => b.mode == 'osu');
        },
        taikoBeatmaps: (state): Beatmap[] => {
            return state.beatmaps.filter(b => b.mode == 'taiko');
        },
        catchBeatmaps: (state): Beatmap[] => {
            return state.beatmaps.filter(b => b.mode == 'catch');
        },
        maniaBeatmaps: (state): Beatmap[] => {
            return state.beatmaps.filter(b => b.mode == 'mania');
        },
    },
};

export default store;
