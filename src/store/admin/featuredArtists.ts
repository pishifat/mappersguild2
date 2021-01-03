import { Module } from 'vuex';
import { MainState } from '@store/main';
import { FeaturedArtist } from '../../../interfaces/featuredArtist';

interface FeaturedArtistState {
    featuredArtists: FeaturedArtist[];
}

const store: Module<FeaturedArtistState, MainState> = {
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

                if (i !== -1) featuredArtist.songs[i] = payload.song;
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
};

export default store;
