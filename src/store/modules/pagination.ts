import { Module } from 'vuex';
import { MainState } from '@store/main';

interface PaginationState {
    page: number,
    limit: number,
    maxPages: number,
}

const store: Module<PaginationState, MainState> = {
    namespaced: true,
    state: () => ({
        page: 1,
        limit: 20,
        maxPages: 1,
    }),
    mutations: {
        increasePage (state) {
            state.page += 1;
        },
        decreasePage (state) {
            state.page -= 1;
        },
        resetPagination (state) {
            state.page = 1;
        },
        updateMaxPages (state, maxPages) {
            state.maxPages = maxPages;
        },
    },
    actions: {
        updateMaxPages ({ state, commit }, length) {
            const maxPages = Math.ceil(length / state.limit);

            commit('resetPagination');
            commit('updateMaxPages', maxPages);
        },
    },
};

export default store;
