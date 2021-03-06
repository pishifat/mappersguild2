import { FeaturedArtist } from '@interfaces/featuredArtist';
import { User } from '@interfaces/user';
import { createStore } from 'vuex';
import toastsModule from './modules/toasts';

export interface MainState {
    initialized: boolean;
    isLoading: boolean;
    loggedInUser: User | null;
    homeArtists: FeaturedArtist[];
    limit: number;
}

export const store = createStore<MainState>({
    modules: {
        toasts: toastsModule,
    },
    state: {
        initialized: false,
        isLoading: false,
        loggedInUser: null,
        homeArtists: [],
        limit: 6,
    },
    mutations: {
        setInitialData (state, user: User | null) {
            state.loggedInUser = user;
            state.initialized = true;
        },
        setHomeArtists (state, homeArtists) {
            state.homeArtists = homeArtists;
        },
        setLimit (state, limit) {
            state.limit = limit;
        },
        updateLoadingState (state) {
            state.isLoading = !state.isLoading;
        },
        setAvailablePoints (state, points) {
            if (state.loggedInUser) state.loggedInUser.availablePoints = points;
        },
        updateLoggedInUser (state, user: User): void {
            state.loggedInUser = user;
        },
    },
    strict: process.env.NODE_ENV !== 'production',
});
