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
        updateReferenceUrl (state, payload): void {
            const featuredArtist = state.featuredArtists.find(f => f.id == payload.featuredArtistId);

            if (featuredArtist) {
                featuredArtist.referenceUrl = payload.referenceUrl;
            }
        },
        updateOszTemplatesUrl (state, payload): void {
            const featuredArtist = state.featuredArtists.find(f => f.id == payload.featuredArtistId);

            if (featuredArtist) {
                featuredArtist.oszTemplatesUrl = payload.oszTemplatesUrl;
            }
        },
        updateOfferedUsers (state, payload): void {
            const featuredArtist = state.featuredArtists.find(f => f.id == payload.featuredArtistId);

            if (featuredArtist) {
                featuredArtist.offeredUsers = payload.offeredUsers;
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
        updateReviewComment (state, payload): void {
            const featuredArtist = state.featuredArtists.find(f => f.id == payload.featuredArtistId);

            if (featuredArtist) {
                featuredArtist.reviewComment = payload.reviewComment;
            }
        },
        updateLastReviewed (state, payload): void {
            const featuredArtist = state.featuredArtists.find(f => f.id == payload.featuredArtistId);

            if (featuredArtist) {
                featuredArtist.lastReviewed = payload.lastReviewed;
            }
        },
        updatePermanentlyDismiss (state, payload): void {
            const featuredArtist = state.featuredArtists.find(f => f.id == payload.featuredArtistId);

            if (featuredArtist) {
                featuredArtist.permanentlyDismiss = payload.permanentlyDismiss;
            }
        },
    },
};

export default store;
