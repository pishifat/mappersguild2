import { Module } from 'vuex';
import { FeaturedArtist } from '../../interfaces/featuredArtist';
import { MainState } from './main';

interface ShowcaseState {
    showcaseArtists: FeaturedArtist[];
}

const store: Module<ShowcaseState, MainState> = {
    namespaced: true,
    state: {
        showcaseArtists: [],
    },
    mutations: {
        setShowcaseArtists (state, artists: FeaturedArtist[]): void {
            state.showcaseArtists = artists;
        },
        updateArtist (state, artist: FeaturedArtist): void {
            const i = state.showcaseArtists.findIndex(a => a.id === artist.id);
            if (i !== -1) state.showcaseArtists[i] = artist;
        },
    },
};

export default store;
