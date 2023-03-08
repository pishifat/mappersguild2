import { Module } from 'vuex';
import { User } from '@interfaces/user';
import { FilterMode } from '@interfaces/extras';
import { MainState } from './main';

interface UsersState {
    users: User[];
    selectedUserId: string | null;
    filterValue: string;
    filterMode: FilterMode;
    sortBy: 'username' | 'rank' | 'createdAt';
    sortDesc: boolean;
    pagination: {
        page: number,
        limit: number,
        maxPages: number,
    };
}

const store: Module<UsersState, MainState> = {
    namespaced: true,
    state: {
        users: [],
        selectedUserId: null,
        filterValue: '',
        filterMode: FilterMode.any,
        sortBy: 'rank',
        sortDesc: true,
        pagination: {
            page: 1,
            limit: 16,
            maxPages: 1,
        },
    },
    mutations: {
        setUsers (state, users: User[]): void {
            state.users = users;
        },
        setFilterValue (state, value: string): void {
            state.filterValue = value;
        },
        setFilterMode (state, mode: FilterMode): void {
            state.filterMode = mode;
        },
        setSelectedUserId (state, id: string): void {
            state.selectedUserId = id;
        },
        updateUser (state, user: User): void {
            const i = state.users.findIndex(u => u.id === user.id);
            if (i !== -1) state.users[i] = user;
        },
        setSortBy (state, sortBy: 'username' | 'rank' | 'createdAt'): void {
            state.sortBy = sortBy;
        },
        setSortDesc (state, value: boolean): void {
            state.sortDesc = value;
        },
        increasePaginationPage (state): void {
            state.pagination.page += 1;
        },
        decreasePaginationPage (state): void {
            state.pagination.page -= 1;
        },
        resetPaginationPage (state): void {
            state.pagination.page = 1;
        },
        updatePaginationMaxPages (state, value: number): void {
            state.pagination.maxPages = value;
        },
    },
    getters: {
        filteredUsers: (state): User[] => {
            let users = [...state.users];

            if (state.filterMode !== FilterMode.any) {
                const mode = state.filterMode;

                users = users.filter(u => {
                    if (mode == 'osu' && u.osuPoints) return true;
                    if (mode == 'taiko' && u.taikoPoints) return true;
                    if (mode == 'catch' && u.catchPoints) return true;
                    if (mode == 'mania' && u.maniaPoints) return true;

                    return false;
                });
            }

            if (state.filterValue.length > 2) {
                users = users.filter(u => {
                    return u.username.toLowerCase().includes(state.filterValue.toLowerCase());
                });
            }

            if (state.sortBy === 'createdAt') {
                users.sort((a, b) => +a.createdAt - +b.createdAt);
            } else if (state.sortBy === 'username') {
                users.sort((a, b) => b.username.toLowerCase().localeCompare(a.username.toLowerCase()));
            } else if (state.sortBy === 'rank') {
                if (state.filterMode === 'osu') {
                    users.sort((a, b) => a.osuPoints - b.osuPoints);
                }

                else if (state.filterMode === 'taiko') {
                    users.sort((a, b) => a.taikoPoints - b.taikoPoints);
                }

                else if (state.filterMode === 'catch') {
                    users.sort((a, b) => a.catchPoints - b.catchPoints);
                }

                else if (state.filterMode === 'mania') {
                    users.sort((a, b) => a.maniaPoints - b.maniaPoints);
                }

                else {
                    users.sort((a, b) => a.totalPoints - b.totalPoints);
                }
            }

            if (state.sortDesc) {
                users.reverse();
            }

            return users;
        },
        paginatedUsers: (state, getters): User[] => {
            return getters.filteredUsers.slice(
                state.pagination.limit * (state.pagination.page - 1),
                state.pagination.limit * state.pagination.page
            );
        },
        selectedUser: (state): User | undefined => {
            return state.users.find(u => u.id === state.selectedUserId);
        },
        allUsers: (state): User[] => {
            return state.users;
        },
    },
    actions: {
        updateFilterMode ({ commit }, mode: string): void {
            commit('resetPaginationPage');
            commit('setFilterMode', mode);
        },
        updateFilterValue ({ commit }, value: string): void {
            commit('resetPaginationPage');
            commit('setFilterValue', value);
        },
        updatePaginationMaxPages ({ commit, getters, state }): void {
            const maxPages = Math.ceil(getters.filteredUsers.length / state.pagination.limit);

            commit('updatePaginationMaxPages', maxPages);
        },
        updateSorting ({ commit, state }, sortBy): void {
            if (state.sortBy !== sortBy || state.sortDesc === false) {
                commit('setSortDesc', true);
            } else {
                commit('setSortDesc', false);
            }

            commit('setSortBy', sortBy);
        },
    },
};

export default store;
