import { FeaturedArtist } from '@interfaces/featuredArtist';
import { User } from '@interfaces/user';
import { StoreOptions } from 'vuex';
import toastsModule from './modules/toasts';

interface MainState {
    initialized: boolean;
    isLoading: boolean;
    loggedInUser: User | null;
    homeArtists: FeaturedArtist[],
}

const main: StoreOptions<MainState> = {
    modules: {
        toasts: toastsModule,
    },
    state: {
        initialized: false,
        isLoading: false,
        loggedInUser: null,
        homeArtists: [],
    },
    mutations: {
        setInitialData (state, payload) {
            state.loggedInUser = payload.me;
            state.initialized = true;
        },
        setHomeData (state, homeArtists) {
            state.homeArtists = homeArtists;
        },
        updateLoadingState (state) {
            state.isLoading = !state.isLoading;
        },
        setAvailablePoints (state, points) {
            if (state.loggedInUser) state.loggedInUser.availablePoints = points;
        },
    },
    strict: process.env.NODE_ENV !== 'production',
};

export default main;
