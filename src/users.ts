import Vue from 'vue';
import Vuex from 'vuex';
import Axios from 'axios';
import mixins from './mixins';
import './bootstrap';
import UserPage from './pages/users/UserPage.vue';
import { User, UserGroup } from '../interfaces/user';
import { FilterMode } from '../interfaces/extras';
import { Beatmap } from '../interfaces/beatmap/beatmap';

$(document).ready(function() {
    $('#limitedEditBeatmap').on('hide.bs.modal', function() {
        $('#extendedInfo').css('z-index', '10000');
    });
});

Vue.mixin(mixins);
Vue.use(Vuex);

interface ToastMessage {
    message: string;
    type?: 'error' | 'success' | 'info';
}

const store = new Vuex.Store({
    state: {
        userId: null as null | User['id'],
        username: '' as User['username'],
        userGroup: null as null | UserGroup,
        users: [] as User[],
        beatmaps: [] as Beatmap[],
        selectedUserId: null as string | null,
        filterValue: '',
        filterMode: 'any' as FilterMode,
        sortBy: 'createdAt' as 'username' | 'rank' | 'createdAt',
        sortDesc: false,
        toastMessages: [] as ToastMessage[],
        pagination: {
            page: 1,
            limit: 16,
            maxPages: 1,
        },
    },
    mutations: {
        setUserId (state, id: User['id']): void {
            state.userId = id;
        },
        setUsername (state, username: User['username']): void {
            state.username = username;
        },
        setUserGroup (state, group: UserGroup): void {
            state.userGroup = group;
        },
        setUsers (state, users: User[]): void {
            state.users = users;
        },
        setBeatmaps (state, beatmaps: Beatmap[]): void {
            state.beatmaps = beatmaps;
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
            if (i !== -1) Vue.set(state.users, i, user);
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
        addToastMessage (state, message: ToastMessage): void {
            state.toastMessages.push(message);
        },
        removeFirstToastMessage (state): void {
            state.toastMessages.splice(0, 1);
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
        async loadQuests ({ commit, state }): Promise<void> {
            commit('setIsLoadingQuests', true);

            const response = await Axios.get(`/quests/search?mode=${state.filterMode}`);

            if (response.data?.quests && !response.data?.quests.error) {
                commit('setQuests', response.data.quests);
            }

            commit('setIsLoadingQuests', false);
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
        updateToastMessages ({ commit }, message: ToastMessage): void {
            commit('addToastMessage', message);

            setTimeout(() => {
                commit('removeFirstToastMessage');
            }, 5000);
        },
    },
    strict: process.env.NODE_ENV !== 'production',
});

new Vue({
    el: '#app',
    store,
    components: {
        UserPage,
    },
});
