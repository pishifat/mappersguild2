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
        updateOsuId (state, payload): void {
            const featuredArtist = state.featuredArtists.find(f => f.id == payload.featuredArtistId);

            if (featuredArtist) {
                featuredArtist.osuId = payload.osuId;
            }
        },
        updateName (state, payload): void {
            const featuredArtist = state.featuredArtists.find(f => f.id == payload.featuredArtistId);

            if (featuredArtist) {
                featuredArtist.label = payload.name;
            }
        },
        addSong (state, payload): void {
            const featuredArtist = state.featuredArtists.find(f => f.id == payload.featuredArtistId);

            if (featuredArtist) {
                featuredArtist.songs.push(payload.song);
            }
        },
        updateSong (state, payload): void {
            const featuredArtist = state.featuredArtists.find(f => f.id == payload.featuredArtistId);

            if (featuredArtist) {
                const i = featuredArtist.songs.findIndex(s => s.id == payload.song.id);

                if (i !== -1)  Vue.set(featuredArtist.songs, i, payload.song);
            }
        },
        deleteSong (state, payload): void {
            const featuredArtist = state.featuredArtists.find(f => f.id == payload.featuredArtistId);

            if (featuredArtist) {
                const i = featuredArtist.songs.findIndex(s => s.id == payload.songId);

                if (i !== -1) {
                    featuredArtist.songs.splice(i, 1);
                }
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
