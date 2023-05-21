<template>
    <modal-dialog id="editFeaturedArtist" :loaded="Boolean(featuredArtist)">
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
            <div class="container">
                <h5>General</h5>
                <div class="row mb-2 mx-1">
                    <input
                        v-model="osuId"
                        class="form-control form-control-sm mx-2 w-50"
                        type="text"
                        autocomplete="off"
                        placeholder="osu id..."
                        @keyup.enter="updateOsuId($event)"
                    />
                    <button class="btn btn-sm btn-outline-info w-25" @click="updateOsuId($event)">
                        Save osu! ID
                    </button>
                </div>
                <div class="row mb-2 mx-1">
                    <input
                        v-model="name"
                        class="form-control form-control-sm mx-2 w-50"
                        type="text"
                        autocomplete="off"
                        placeholder="artist name..."
                        @keyup.enter="updateName($event)"
                    />
                    <button class="btn btn-sm btn-outline-info w-25" @click="updateName($event)">
                        Save name
                    </button>
                </div>
                <div class="row mb-2 mx-1">
                    <select v-model="status" class="form-select form-select-sm w-50 mx-2">
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
                    <button class="btn btn-sm btn-outline-info w-25" @click="updateStatus($event)">
                        Save status
                    </button>
                </div>
                <hr />
                <h5>Showcase info</h5>
                <div class="row mb-2 mx-1">
                    <input
                        v-model="referenceUrl"
                        class="form-control form-control-sm mx-2 w-50"
                        type="text"
                        autocomplete="off"
                        placeholder="artist reference url..."
                        @keyup.enter="updateReferenceUrl($event)"
                    />
                    <button class="btn btn-sm btn-outline-info w-25" @click="updateReferenceUrl($event)">
                        Save reference URL
                    </button>
                </div>
                <div class="row mb-2 mx-1">
                    <input
                        v-model="oszTemplatesUrl"
                        class="form-control form-control-sm mx-2 w-50"
                        type="text"
                        autocomplete="off"
                        placeholder="osz templates url..."
                        @keyup.enter="updateOszTemplatesUrl($event)"
                    />
                    <button class="btn btn-sm btn-outline-info w-25" @click="updateOszTemplatesUrl($event)">
                        Save .osz templates URL
                    </button>
                </div>
                <div class="row mb-2 mx-1">
                    <input
                        v-model="offeredUsers"
                        class="form-control form-control-sm mx-2 w-50"
                        type="text"
                        autocomplete="off"
                        placeholder="offered user usernames..."
                        @keyup.enter="updateOfferedUsers($event)"
                    />
                    <button class="btn btn-sm btn-outline-info w-25" @click="updateOfferedUsers($event)">
                        Save offered users
                    </button>
                </div>
                <div v-if="featuredArtist.offeredUsers && featuredArtist.offeredUsers.length" class="small mx-4">
                    offered:
                    <user-link-list
                        :users="featuredArtist.offeredUsers"
                    />
                </div>
                <div v-if="featuredArtist.showcaseMappers && featuredArtist.showcaseMappers.length" class="small mx-4">
                    showcase mappers:
                    <user-link-list
                        :users="featuredArtist.showcaseMappers"
                    />
                </div>
                <hr />
                <h5>Songs</h5>
                <div class="row mb-2 mx-2 w-50">
                    <select id="editSongSelection" v-model="selectedSong" class="form-select form-select-sm">
                        <option v-for="song in alphabeticalSongs" :key="song.id" :value="song">
                            {{ song.title }} --- ({{ song.artist }})
                        </option>
                    </select>
                </div>
                <div class="row mb-2 mx-2">
                    <input
                        v-model="artist"
                        class="form-control form-control-sm w-75"
                        type="text"
                        autocomplete="off"
                        placeholder="artist..."
                    />
                </div>
                <div class="row mb-2 mx-2">
                    <input
                        v-model="title"
                        class="form-control form-control-sm w-75"
                        type="text"
                        autocomplete="off"
                        placeholder="title..."
                    />
                </div>
                <div class="mx-1">
                    <button class="btn btn-sm btn-outline-info mx-1" @click="addSong($event)">
                        Add song
                    </button>
                    <button class="btn btn-sm btn-outline-info mx-1" @click="editSong($event)">
                        Edit song
                    </button>
                    <button class="btn btn-sm btn-outline-danger mx-1" @click="deleteSong($event)">
                        Delete song
                    </button>
                </div>
                <hr />
                <h5>Notes</h5>
                <div class="row mb-2 mx-1">
                    <input
                        v-model="notes"
                        class="form-control form-control-sm mx-2 w-50"
                        type="text"
                        autocomplete="off"
                        placeholder="notes..."
                        @keyup.enter="updateNotes($event)"
                    />
                    <button class="btn btn-sm btn-outline-info w-25" @click="updateNotes($event)">
                        Update notes
                    </button>
                </div>
                <div class="row mb-2">
                    <span class="col-sm-6">
                        Last reviewed:
                        <span class="text-secondary">{{ new Date(featuredArtist.lastReviewed) || 'Never' }}</span>
                    </span>
                    <button class="btn btn-sm btn-outline-info ms-3 w-25" @click="updateLastReviewed($event)">
                        Set as today
                    </button>
                </div>
                <div class="row mb-2">
                    <span class="col-sm-6">
                        Permanently dismissed:
                        <span class="text-danger me-2">{{ featuredArtist.permanentlyDismiss ? 'true' : 'false' }}</span>
                    </span>
                    <button class="btn btn-sm btn-outline-info ms-3 w-25" @click="updatePermanentlyDismiss($event)">
                        Toggle
                    </button>
                </div>
            </div>
        </template>
    </modal-dialog>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import ModalDialog from '@components/ModalDialog.vue';
import { FeaturedArtist } from '@interfaces/featuredArtist';
import { FeaturedSong } from '@interfaces/featuredSong';
import UserLinkList from '@components/UserLinkList.vue';

export default defineComponent({
    name: 'FeaturedArtistInfo',
    components: {
        ModalDialog,
        UserLinkList,
    },
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
            referenceUrl: '',
            oszTemplatesUrl: '',
            offeredUsers: '',
            selectedSong: null as null | FeaturedSong,
            artist: '',
            title: '',
            notes: '',
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
            this.referenceUrl = this.featuredArtist.referenceUrl;
            this.oszTemplatesUrl = this.featuredArtist.oszTemplatesUrl;
            this.offeredUsers = this.generateUserListText(this.featuredArtist.offeredUsers);
            this.title = '';
            this.notes = this.featuredArtist.notes;
        },
        selectedSong(): void {
            if (this.selectedSong) {
                this.artist = this.selectedSong.artist;
                this.title = this.selectedSong.title;
            }
        },
    },
    methods: {
        generateUserListText(users): string {
            let text = '';

            if (!users || !users.length) {
                return text;
            } else {
                const usernames = users.map(u => u.username);

                return usernames.join(', ');
            }
        },
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
        async updateReferenceUrl(e): Promise<void> {
            const referenceUrl = await this.$http.executePost(`/admin/featuredArtists/${this.featuredArtist.id}/updateReferenceUrl`, { referenceUrl: this.referenceUrl }, e);

            if (!this.$http.isError(referenceUrl)) {
                this.$store.dispatch('updateToastMessages', {
                    message: `updated reference URL`,
                    type: 'info',
                });
                this.$store.commit('updateReferenceUrl', {
                    featuredArtistId: this.featuredArtist.id,
                    referenceUrl,
                });
            }
        },
        async updateOszTemplatesUrl(e): Promise<void> {
            const oszTemplatesUrl = await this.$http.executePost(`/admin/featuredArtists/${this.featuredArtist.id}/updateOszTemplatesUrl`, { oszTemplatesUrl: this.oszTemplatesUrl }, e);

            if (!this.$http.isError(oszTemplatesUrl)) {
                this.$store.dispatch('updateToastMessages', {
                    message: `updated osz templates URL`,
                    type: 'info',
                });
                this.$store.commit('updateOszTemplatesUrl', {
                    featuredArtistId: this.featuredArtist.id,
                    oszTemplatesUrl,
                });
            }
        },
        async updateOfferedUsers(e): Promise<void> {
            const offeredUsers = await this.$http.executePost(`/admin/featuredArtists/${this.featuredArtist.id}/updateOfferedUsers`, { offeredUsers: this.offeredUsers }, e);

            if (!this.$http.isError(offeredUsers)) {
                this.$store.dispatch('updateToastMessages', {
                    message: `updated offered users`,
                    type: 'info',
                });
                this.$store.commit('updateOfferedUsers', {
                    featuredArtistId: this.featuredArtist.id,
                    offeredUsers,
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
        async updateNotes(e): Promise<void> {
            const notes = await this.$http.executePost(`/admin/featuredArtists/${this.featuredArtist.id}/updateNotes`, { notes: this.notes }, e);

            if (!this.$http.isError(notes)) {
                this.$store.dispatch('updateToastMessages', {
                    message: `updated review comment`,
                    type: 'info',
                });
                this.$store.commit('updateNotes', {
                    featuredArtistId: this.featuredArtist.id,
                    notes,
                });
            }
        },
        async updateLastReviewed(e): Promise<void> {
            const lastReviewed = await this.$http.executePost(`/admin/featuredArtists/${this.featuredArtist.id}/updateLastReviewed`, {}, e);

            if (!this.$http.isError(lastReviewed)) {
                this.$store.dispatch('updateToastMessages', {
                    message: `updated last reviewed`,
                    type: 'info',
                });
                this.$store.commit('updateLastReviewed', {
                    featuredArtistId: this.featuredArtist.id,
                    lastReviewed,
                });
            }
        },
        async updatePermanentlyDismiss(e): Promise<void> {
            const permanentlyDismiss = await this.$http.executePost(`/admin/featuredArtists/${this.featuredArtist.id}/togglePermanentlyDismiss`, {}, e);

            if (!this.$http.isError(permanentlyDismiss)) {
                this.$store.dispatch('updateToastMessages', {
                    message: `updated permanenlty dismiss: ${permanentlyDismiss}`,
                    type: 'info',
                });
                this.$store.commit('updatePermanentlyDismiss', {
                    featuredArtistId: this.featuredArtist.id,
                    permanentlyDismiss,
                });
            }
        },
    },
});
</script>