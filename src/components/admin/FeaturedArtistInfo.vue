<template>
    <modal-dialog id="edit" :loaded="Boolean(featuredArtist)">
        <template #header>
            <a
                v-if="featuredArtist.osuId"
                :href="'https://osu.ppy.sh/beatmaps/artists/' + featuredArtist.osuId"
                target="_blank"
            >
                {{ featuredArtist.label }}
            </a>
            <span v-else>{{ featuredArtist.label }}</span>
            ({{ featuredArtist.songs.length }})
        </template>

        <template #default>
            <p>
                <button class="btn btn-sm btn-outline-info" @click="updateOsuId($event)">
                    Save osu! ID
                </button>
                <input
                    v-model="osuId"
                    class="form-control form-control-sm mx-2 w-50"
                    type="text"
                    autocomplete="off"
                    placeholder="osu id..."
                >
            </p>
            <p>
                <button class="btn btn-sm btn-outline-info" @click="updateName($event)">
                    Save name
                </button>
                <input
                    v-model="name"
                    class="form-control form-control-sm mx-2 w-50"
                    type="text"
                    autocomplete="off"
                    placeholder="artist name..."
                >
            </p>
            <p class="row">
                <select v-model="status" class="form-control form-control-sm w-25 mx-2">
                    <option value="public">
                        Public
                    </option>
                    <option value="private">
                        Private
                    </option>
                    <option value="showcase">
                        Showcase
                    </option>
                </select>
                <button class="btn btn-sm btn-outline-info" @click="updateStatus($event)">
                    Save status
                </button>
            </p>
            <p>
                <select id="editSongSelection" v-model="selectedSong" class="form-control form-control-sm">
                    <option v-for="song in alphabeticalSongs" :key="song.id" :value="song">
                        {{ song.title }} --- ({{ song.artist }})
                    </option>
                </select>
            </p>
            <p>
                <input
                    v-model="artist"
                    class="form-control form-control-sm mx-2 w-75"
                    type="text"
                    autocomplete="off"
                    placeholder="artist..."
                >
            </p>
            <p>
                <input
                    v-model="title"
                    class="form-control form-control-sm mx-2 w-75"
                    type="text"
                    autocomplete="off"
                    placeholder="title..."
                >
            </p>
            <p>
                <button class="btn btn-sm btn-outline-info" @click="addSong($event)">
                    Add song
                </button>
                <button class="btn btn-sm btn-outline-info" @click="editSong($event)">
                    Edit song
                </button>
                <button class="btn btn-sm btn-outline-danger" @click="deleteSong($event)">
                    Delete song
                </button>
            </p>
        </template>
    </modal-dialog>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import ModalDialog from '@components/ModalDialog.vue';
import { FeaturedArtist } from '../../../interfaces/featuredArtist';
import { FeaturedSong } from '../../../interfaces/featuredSong';

export default defineComponent({
    name: 'FeaturedArtistInfo',
    components: { ModalDialog },
    props: {
        featuredArtist: {
            type: Object as () => FeaturedArtist,
            default: null,
        },
    },
    data() {
        return {
            osuId: 0,
            name: '',
            status: '',
            selectedSong: null as null | FeaturedSong,
            artist: '',
            title: '',
        };
    },
    computed: {
        alphabeticalSongs(): FeaturedSong[] {
            return [...this.featuredArtist.songs].sort((a,b) => {
                if (a.title.toLowerCase() > b.title.toLowerCase()) return 1;
                else if (b.title.toLowerCase() > a.title.toLowerCase()) return -1;
                else return 0;
            });
        },
    },
    watch: {
        featuredArtist(): void {
            this.osuId = this.featuredArtist.osuId;
            this.name = this.featuredArtist.label;
            this.status = this.featuredArtist.status;
            this.title = '';
        },
        selectedSong(): void {
            if (this.selectedSong) {
                this.artist = this.selectedSong.artist;
                this.title = this.selectedSong.title;
            }
        },
    },
    methods: {
        async updateOsuId(e): Promise<void> {
            const osuId = await this.$http.executePost(`/admin/featuredArtists/${this.featuredArtist.id}/updateOsuId`, { osuId: this.osuId }, e);

            if (!this.$http.isError(osuId)) {
                this.$store.dispatch('updateToastMessages', {
                    message: `updated osu id`,
                    type: 'info',
                });
                this.$store.commit('updateOsuId', {
                    featuredArtistId: this.featuredArtist.id,
                    osuId,
                });
            }

            // mark artist as "released" on /artists
            await this.$http.executePost('/artists/toggleIsUpToDate/' + this.featuredArtist.id, { value: true });
        },
        async updateName(e): Promise<void> {
            const name = await this.$http.executePost(`/admin/featuredArtists/${this.featuredArtist.id}/updateName`, { name: this.name }, e);

            if (!this.$http.isError(name)) {
                this.$store.dispatch('updateToastMessages', {
                    message: `updated name`,
                    type: 'info',
                });
                this.$store.commit('updateName', {
                    featuredArtistId: this.featuredArtist.id,
                    name,
                });
            }
        },
        async updateStatus(e): Promise<void> {
            const status = await this.$http.executePost(`/admin/featuredArtists/${this.featuredArtist.id}/updateStatus`, { status: this.status }, e);

            if (!this.$http.isError(status)) {
                this.$store.dispatch('updateToastMessages', {
                    message: `updated status`,
                    type: 'info',
                });
                this.$store.commit('updateStatus', {
                    featuredArtistId: this.featuredArtist.id,
                    status,
                });
            }
        },
        async addSong(e): Promise<void> {
            const song = await this.$http.executePost(`/admin/featuredArtists/${this.featuredArtist.id}/songs/create`, { artist: this.artist, title: this.title }, e);

            if (!this.$http.isError(song)) {
                this.$store.dispatch('updateToastMessages', {
                    message: `added song`,
                    type: 'info',
                });
                this.$store.commit('addSong', {
                    featuredArtistId: this.featuredArtist.id,
                    song,
                });
            }
        },
        async editSong(e): Promise<void> {
            if (!this.selectedSong) {
                this.$store.dispatch('updateToastMessages', { message: 'Select a song' });

                return;
            }

            const song = await this.$http.executePost(`/admin/featuredArtists/${this.featuredArtist.id}/songs/${this.selectedSong.id}/update`, { artist: this.artist, title: this.title }, e);

            if (!this.$http.isError(song)) {
                this.$store.dispatch('updateToastMessages', {
                    message: `updated song`,
                    type: 'info',
                });
                this.$store.commit('updateSong', {
                    featuredArtistId: this.featuredArtist.id,
                    song,
                });
            }
        },
        async deleteSong(e): Promise<void> {
            if (!this.selectedSong) {
                this.$store.dispatch('updateToastMessages', { message: 'Select a song' });

                return;
            }

            const res = await this.$http.executePost(`/admin/featuredArtists/${this.featuredArtist.id}/songs/${this.selectedSong.id}/delete`, {}, e);

            if (!this.$http.isError(res)) {
                this.$store.dispatch('updateToastMessages', {
                    message: `deleted song`,
                    type: 'info',
                });
                this.$store.commit('deleteSong', {
                    featuredArtistId: this.featuredArtist.id,
                    songId: this.selectedSong.id,
                });
            }
        },
    },
});
</script>