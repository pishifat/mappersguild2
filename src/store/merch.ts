import { Module } from 'vuex';
import { Merch } from '@interfaces/merch';
import { MainState } from './main';

interface UsersState {
    merch: Merch[];
}

const store: Module<UsersState, MainState> = {
    namespaced: true,
    state: {
        merch: [],
    },
    mutations: {
        setMerch (state, merch: Merch[]): void {
            state.merch = merch;
        },
    },
    getters: {
        allMerch: (state): Merch[] => {
            return state.merch;
        },
    },
};

export default store;
