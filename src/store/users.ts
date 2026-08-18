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
    loadedRanks: number[];
    rankTotals: Record<number, number>;
}

const defaultLoadedRanks = [3, 4, 5];

const store: Module<UsersState, MainState> = {
    namespaced: true,
    state: {
        users: [],
        selectedUserId: null,
        filterValue: '',
        filterMode: FilterMode.any,
        sortBy: 'rank',
        sortDesc: true,
        loadedRanks: [...defaultLoadedRanks],
        rankTotals: {},
    },
    mutations: {
        setUsers (state, users: User[]): void {
            state.users = users;
        },
        addUsers (state, users: User[]): void {
            for (const user of users) {
                const i = state.users.findIndex(u => u.id === user.id);

                if (i === -1) {
                    state.users.push(user);
                } else {
                    state.users[i] = user;
                }
            }
        },
        addSpecificUser (state, user: User): void {
            const i = state.users.findIndex(u => u.id === user.id);

            if (i === -1) {
                state.users.push(user);
            } else {
                state.users[i] = user;
            }
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
        markRankLoaded (state, rank: number): void {
            if (!state.loadedRanks.includes(rank)) {
                state.loadedRanks.push(rank);
            }
        },
        resetLoadedRanks (state): void {
            state.loadedRanks = [...defaultLoadedRanks];
        },
        setRankTotal (state, { rank, total }: { rank: number; total: number }): void {
            state.rankTotals[rank] = total;
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
        selectedUser: (state): User | undefined => {
            return state.users.find(u => u.id === state.selectedUserId);
        },
        allUsers: (state): User[] => {
            return state.users;
        },
        isRankLoaded: (state) => (rank: number): boolean => {
            return state.loadedRanks.includes(rank);
        },
        findLocalUser: (state) => (query: string): User | undefined => {
            const lowerQuery = query.toLowerCase();

            return state.users.find(u => u.username.toLowerCase() === lowerQuery || String(u.osuId) === query);
        },
    },
    actions: {
        updateFilterMode ({ commit }, mode: string): void {
            commit('setFilterMode', mode);
        },
        updateFilterValue ({ commit }, value: string): void {
            commit('setFilterValue', value);
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
