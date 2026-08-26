import { Module } from 'vuex';
import { MainState } from './main';
import { Background } from '@interfaces/background';

interface BackgroundsState {
    backgrounds: Background[];
    filterValue: string;
    sortBy: 'newest' | 'oldest';
    filterCreator: 'any' | 'me';
}

const store: Module<BackgroundsState, MainState> = {
    namespaced: true,
    state: {
        backgrounds: [],
        filterValue: '',
        sortBy: 'newest',
        filterCreator: 'any',
    },
    mutations: {
        setBackgrounds (state, backgrounds: Background[]): void {
            state.backgrounds = backgrounds;
        },
        appendBackgrounds (state, backgrounds: Background[]): void {
            state.backgrounds.push(...backgrounds);
        },
        addBackground (state, background: Background): void {
            state.backgrounds.unshift(background);
        },
        updateBackground (state, background: Background): void {
            const i = state.backgrounds.findIndex(b => b.id === background.id);
            if (i !== -1) state.backgrounds[i] = background;
        },
        setFilterValue (state, value: string): void {
            state.filterValue = value;
        },
        setSortBy (state, sortBy: 'newest' | 'oldest'): void {
            state.sortBy = sortBy;
        },
        setFilterCreator (state, filterCreator: 'any' | 'me'): void {
            state.filterCreator = filterCreator;
        },
    },
    actions: {
        updateFilterValue ({ commit }, value: string): void {
            commit('setFilterValue', value);
        },
        updateSorting ({ commit }, sortBy: 'newest' | 'oldest'): void {
            commit('setSortBy', sortBy);
        },
        updateFilterCreator ({ commit }, filterCreator: 'any' | 'me'): void {
            commit('setFilterCreator', filterCreator);
        },
    },
};

export default store;
