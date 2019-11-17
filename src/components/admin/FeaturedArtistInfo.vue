<template>
    <div id="editFeaturedArtist" class="modal fade" tabindex="-1">
        <div class="modal-dialog">
            <div class="modal-content bg-dark" v-if="featuredArtist">
                <div class="modal-header text-dark bg-rest">
                    <h5 class="modal-title">
                        <a v-if="featuredArtist.osuId" :href="'https://osu.ppy.sh/beatmaps/artists/' + featuredArtist.osuId" class="text-dark" target="_blank">
                            {{ featuredArtist.label }}
                        </a>
                        <span v-else>{{ featuredArtist.label}}</span>
                        ({{ featuredArtist.songs.length }})
                    </h5>
                    <button type="button" class="close" data-dismiss="modal">
                        <span>&times;</span>
                    </button>
                </div>
                <div class="modal-body" style="overflow: hidden">
                    <p>
                        <button class="btn btn-sm btn-outline-info" @click="updateOsuId($event)">
                            Save osu! ID
                        </button> 
                        <input
                            class="form-control-sm mx-2 w-50"
                            type="text"
                            autocomplete="off"
                            placeholder="osu id..."
                            v-model="osuId"
                        />
                    </p>
                    <p>
                        <button class="btn btn-sm btn-outline-info" @click="updateName($event)">
                            Save name
                        </button> 
                        <input
                            class="form-control-sm mx-2 w-50"
                            type="text"
                            autocomplete="off"
                            placeholder="artist name..."
                            v-model="name"
                        />
                    </p>
                    <p>
                        <select v-model="selectedSong" class="form-control form-control-sm" id="editSongSelection">
                            <option v-for="song in alphabeticalSongs" :value="song" :key="song.id">
                                {{song.title}} --- ({{song.artist}})
                            </option>
                        </select>
                    </p>
                    <p>
                        <input
                            class="form-control-sm mx-2 w-75"
                            type="text"
                            autocomplete="off"
                            placeholder="artist..."
                            v-model="artist"
                        />
                    </p>
                    <p>
                        <input
                            class="form-control-sm mx-2 w-75"
                            type="text"
                            autocomplete="off"
                            placeholder="title..."
                            v-model="title"
                        />
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
                </div>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: 'featured-artist-info',
    props: ['featured-artist'],
    watch: {
        featuredArtist: function() {
            this.osuId = this.featuredArtist.osuId;
            this.name = this.featuredArtist.label;
            this.artist = null;
            this.title = null;
        },
        selectedSong: function() {
            this.artist = this.selectedSong.artist;
            this.title = this.selectedSong.title;
        },
    },
    computed: {
        alphabeticalSongs: function() {
            return this.featuredArtist.songs.sort((a,b) => {
                if(a.title.toLowerCase() > b.title.toLowerCase()) return 1;
                else if(b.title.toLowerCase() > a.title.toLowerCase()) return -1;
                else return 0;
            });
        }
    },
    methods: {
        executePost: async function(path, data, e) {
            if (e) e.target.disabled = true;

            try {
                const res = await axios.post(path, data);

                if (res.data.error) {
                    this.info = res.data.error;
                } else {
                    if (e) e.target.disabled = false;
                    return res.data;
                }
            } catch (error) {
                console.log(error);
            }

            if (e) e.target.disabled = false;
        },
        updateOsuId: async function(e) {
            const fa = await this.executePost('/admin/updateFeaturedArtistOsuId/' + this.featuredArtist.id, { osuId: this.osuId }, e);
            if (fa) {
                this.$emit('update-featured-artist', fa);
            }
        },
        updateName: async function(e) {
            const fa = await this.executePost('/admin/updateFeaturedArtistName/' + this.featuredArtist.id, { name: this.name }, e);
            if (fa) {
                this.$emit('update-featured-artist', fa);
            }
        },
        addSong: async function(e) {
            const fa = await this.executePost('/admin/addSong/' + this.featuredArtist.id, { artist: this.artist, title: this.title }, e);
            if (fa) {
                this.$emit('update-featured-artist', fa);
            }
        },
        editSong: async function(e) {
            const fa = await this.executePost('/admin/editSong/' + this.featuredArtist.id, { songId: this.selectedSong.id, artist: this.artist, title: this.title }, e);
            if (fa) {
                this.$emit('update-featured-artist', fa);
            }
        },
        deleteSong: async function(e) {
            const fa = await this.executePost('/admin/deleteSong/' + this.featuredArtist.id, { songId: this.selectedSong.id }, e);
            if (fa) {
                this.$emit('update-featured-artist', fa);
            }
        },
    },
    data() {
        return {
            osuId: null,
            name: null,
            selectedSong: null,
            artist: null,
            title: null,
        };
    },
};
</script>