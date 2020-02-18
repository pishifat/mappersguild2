import Vue from 'vue';
import Vuex from 'vuex';
import FeaturedArtistPage from '../pages/admin/FeaturedArtistPage.vue';
import '../bootstrap';
import mixins from '../mixins';
import toastsModule from '../modules/toasts';
import { FeaturedArtist } from '../../interfaces/featuredArtist';

Vue.mixin(mixins);
Vue.use(Vuex);

interface FeaturedArtistState {
    featuredArtists: FeaturedArtist[];
}

const store = new Vuex.Store<FeaturedArtistState>({
    modules: {
        toasts: toastsModule,
    },
    state: {
        featuredArtists: [],
    },
    mutations: {
        setFeaturedArtists (state, featuredArtists: FeaturedArtist[]): void {
            state.featuredArtists = featuredArtists;
        },
        toggleActivity (state, payload): void {
            const featuredArtist = state.featuredArtists.find(f => f.id == payload.featuredArtistId);

            if (featuredArtist) {
                featuredArtist.osuId = payload.osuId;
            }
        },
    },
    strict: process.env.NODE_ENV !== 'production',
});

new Vue({
    el: '#app',
    store,
    components: {
        FeaturedArtistPage,
    },
});
