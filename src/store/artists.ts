import Vue from 'vue';
import { FeaturedArtist } from '../../interfaces/featuredArtist';

export default {
    state: {
        artists: [] as FeaturedArtist[],
        filterValue: '',
    },
    mutations: {
        setArtists (state, artists: FeaturedArtist[]): void {
            state.artists = artists;
        },
        setFilterValue (state, value: string): void {
            state.filterValue = value;
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
            let artists = getters.filteredArtists.filter(a => !a.isContacted);

            artists = artists.sort((a,b) => {
                if (a.createdAt < b.createdAt) return 1;
                if (a.createdAt > b.createdAt) return -1;

                return 0;
            });

            return artists;
        },
        upToDate: (state, getters): FeaturedArtist[] => {
            return getters.filteredArtists.filter(a => a.isUpToDate && a.isContacted);
        },
        rejected: (state, getters): FeaturedArtist[] => {
            const artists = getters.filteredArtists.filter(a => a.isRejected && !a.isUpToDate && a.isContacted);

            return artists.sort(function(a,b) {
                if (a.lastContacted < b.lastContacted) return 1;
                if (a.lastContacted > b.lastContacted) return -1;

                return 0;
            });
        },
        updateAvailableArtists: (state, getters): FeaturedArtist[] => {
            const artists = getters.filteredArtists.filter(a => a.osuId && !a.isUpToDate);

            return artists.sort((a,b) => {
                if (a.lastContacted < b.lastContacted) return 1;
                if (a.lastContacted > b.lastContacted) return -1;

                return 0;
            });
        },
        readyArtists: (state, getters): FeaturedArtist[] => {
            const artists = getters.filteredArtists.filter(a => !a.osuId && !a.isUpToDate && (a.ppySigned || a.projectedRelease));
            let projectedReleaseArtists = artists.filter(a => a.projectedRelease);
            let unknownReleaseArtists = artists.filter(a => !a.projectedRelease);

            projectedReleaseArtists = projectedReleaseArtists.sort((a,b) => {
                if (a.projectedRelease < b.projectedRelease) return -1;
                if (a.projectedRelease > b.projectedRelease) return 1;

                return 0;
            });

            unknownReleaseArtists = unknownReleaseArtists.sort((a,b) => {
                if (a.lastContacted < b.lastContacted) return 1;
                if (a.lastContacted > b.lastContacted) return -1;

                return 0;
            });

            return projectedReleaseArtists.concat(unknownReleaseArtists);
        },
        discussionArtists: (state, getters): FeaturedArtist[] => {
            const artists = getters.filteredArtists.filter(a => !a.osuId && !a.isUpToDate && a.isResponded && !a.contractSent && !a.isRejected);

            return artists.sort((a,b) => {
                if (a.lastContacted < b.lastContacted) return 1;
                if (a.lastContacted > b.lastContacted) return -1;

                return 0;
            });
        },
        contractArtists: (state, getters): FeaturedArtist[] => {
            const artists = getters.filteredArtists.filter(a => !a.osuId && !a.isUpToDate && a.isResponded && a.contractSent && !a.ppySigned && !a.isRejected);

            return artists.sort((a,b) => {
                if (a.lastContacted < b.lastContacted) return 1;
                if (a.lastContacted > b.lastContacted) return -1;

                return 0;
            });
        },
        contactedArtists: (state, getters): FeaturedArtist[] => {
            const artists = getters.filteredArtists.filter(a => !a.isResponded && !a.projectedRelease && !a.osuId && !a.isUpToDate && !a.isRejected && a.isContacted);

            return artists.sort((a,b) => {
                if (a.lastContacted < b.lastContacted) return 1;
                if (a.lastContacted > b.lastContacted) return -1;

                return 0;
            });
        },
    },
    actions: {
        updateFilterValue ({ commit }, value: string): void {
            commit('setFilterValue', value);
        },
    },
};
