import { Module } from 'vuex';
import { MainState } from '@store/main';

interface FiltersState {
    mode: string,
    value: string,
}

const store: Module<FiltersState, MainState> = {
    namespaced: true,
    state: () => ({
        mode: '',
        value: '',
    }),
    mutations: {
        setFilterMode (state, mode) {
            state.mode = mode;
        },
        setFilterValue (state, value) {
            state.value = value;
        },
    },
};

export default store;
