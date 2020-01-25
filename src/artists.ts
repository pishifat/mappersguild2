import Vue from 'vue';
import Vuex from 'vuex';
import ArtistPage from './pages/artists/ArtistPage.vue';
import './bootstrap';
import mixins from './mixins';
import { FeaturedArtist } from '@models/featuredSong';
import { User } from '@models/user';

Vue.mixin(mixins);
Vue.use(Vuex);

interface ToastMessage {
    message: string;
    type?: 'error' | 'success' | 'info';
}

const store = new Vuex.Store({
    state: {
        userId: null as null | User['id'],
        artists: [] as FeaturedArtist[],
        filterValue: '',
        toastMessages: [] as ToastMessage[],
    },
    mutations: {
        setUserId (state, id: User['id']): void {
            state.userId = id;
        },
        setArtists (state, artists: FeaturedArtist[]): void {
            state.artists = artists;
        },
        setFilterValue (state, value: string): void {
            state.filterValue = value;
        },
        addToastMessage (state, message: ToastMessage): void {
            state.toastMessages.push(message);
        },
        removeFirstToastMessage (state): void {
            state.toastMessages.splice(0, 1);
        },
        updateArtist (state, artist: FeaturedArtist): void {
            const i = state.artists.findIndex(a => a.id === artist.id);
            if (i !== -1) Vue.set(state.artists, i, artist);
        },
        deleteArtist (state, artist: FeaturedArtist): void {
            const i = state.artists.findIndex(a => a.id === artist.id);
            if (i !== -1) state.artists.splice(i, 1);
        },
        addArtist (state, artist: FeaturedArtist): void {
            state.artists.unshift(artist);
        },
    },
    getters: {
        filteredArtists: (state): FeaturedArtist[] => {
            let artists = state.artists;

            if (state.filterValue.length > 2) {
                artists = artists.filter(a => {
                    return a.label.toLowerCase().includes(state.filterValue.toLowerCase());
                });
            }

            return artists;
        },
        notContacted: (state, getters): FeaturedArtist[] => {
            const artists = getters.filteredArtists.filter(a => !a.isContacted);

            return artists.sort((a, b) => {
                if (a.isPriority === b.isPriority) return 0;
                if (a.isPriority) return -1;

                return 1;
            });
        },
        upToDate: (state, getters): FeaturedArtist[] => {
            return getters.filteredArtists.filter(a => a.isUpToDate && a.isContacted);
        },
        rejected: (state, getters): FeaturedArtist[] => {
            const artists = getters.filteredArtists.filter(a => a.isRejected && !a.isUpToDate && a.isContacted);

            artists.sort(function(a,b) {
                if (a.lastContacted < b.lastContacted) return 1;
                if (a.lastContacted > b.lastContacted) return -1;

                return 0;
            });

            return artists.sort((a, b) => {
                if (a.isPriority === b.isPriority) return 0;
                if (a.isPriority) return -1;

                return 1;
            });
        },
        updateAvailableArtists: (state, getters): FeaturedArtist[] => {
            const artists = getters.filteredArtists.filter(a => a.osuId && !a.isUpToDate && !a.isRejected && a.isContacted);

            artists.sort((a,b) => {
                if (a.lastContacted < b.lastContacted) return 1;
                if (a.lastContacted > b.lastContacted) return -1;

                return 0;
            });

            return artists.sort((a, b) => {
                if (a.isPriority === b.isPriority) return 0;
                if (a.isPriority) return -1;

                return 1;
            });
        },
        projectedReleaseArtists: (state, getters): FeaturedArtist[] => {
            const artists = getters.filteredArtists.filter(a => a.projectedRelease && !a.osuId && !a.isUpToDate && !a.isRejected && a.isContacted);

            return artists.sort((a,b) => {
                if (a.projectedRelease < b.projectedRelease) return -1;
                if (a.projectedRelease > b.projectedRelease) return 1;

                return 0;
            });
        },
        discussionArtists: (state, getters): FeaturedArtist[] => {
            const artists = getters.filteredArtists.filter(a => a.isResponded && !a.projectedRelease && !a.osuId && !a.isUpToDate && !a.isRejected && a.isContacted);

            artists.sort((a,b) => {
                if (a.lastContacted < b.lastContacted) return 1;
                if (a.lastContacted > b.lastContacted) return -1;

                return 0;
            });

            return artists.sort((a, b) => {
                if (a.isPriority === b.isPriority) return 0;
                if (a.isPriority) return -1;

                return 1;
            });
        },
        contactedArtists: (state, getters): FeaturedArtist[] => {
            const artists = getters.filteredArtists.filter(a => !a.isResponded && !a.projectedRelease && !a.osuId && !a.isUpToDate && !a.isRejected && a.isContacted);

            artists.sort((a,b) => {
                if (a.lastContacted < b.lastContacted) return 1;
                if (a.lastContacted > b.lastContacted) return -1;

                return 0;
            });

            return artists.sort((a, b) => {
                if (a.isPriority === b.isPriority) return 0;
                if (a.isPriority) return -1;

                return 1;
            });
        },
    },
    actions: {
        updateFilterValue ({ commit }, value: string): void {
            commit('setFilterValue', value);
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
        ArtistPage,
    },
});
