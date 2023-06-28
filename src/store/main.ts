import { FeaturedArtist } from '@interfaces/featuredArtist';
import { User } from '@interfaces/user';
import { Quest } from '@interfaces/quest';
import { Mission } from '@interfaces/mission';
import { createStore } from 'vuex';
import toastsModule from './modules/toasts';

export interface MainState {
    initialized: boolean;
    isLoading: boolean;
    loggedInUser: User | null;
    homeArtists: FeaturedArtist[];
    exampleQuest: Quest | null;
    exampleMission: Mission | null;
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
        exampleQuest: null,
        exampleMission: null,
        limit: 12,
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
        setExampleQuest (state, exampleQuest) {
            state.exampleQuest = exampleQuest;
        },
        setExampleMission (state, exampleMission) {
            state.exampleMission = exampleMission;
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
