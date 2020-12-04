import { Module } from 'vuex';

interface FiltersState {
    mode: string,
    value: string,
}

const store: Module<FiltersState, any> = {
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
