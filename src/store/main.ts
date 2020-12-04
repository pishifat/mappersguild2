import toastsModule from './modules/toasts';

export default {
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
    },
    strict: process.env.NODE_ENV !== 'production',
};
