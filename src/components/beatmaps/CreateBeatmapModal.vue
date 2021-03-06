<template>
    <modal-dialog id="addBeatmap" title="Add beatmap">
        <div class="container">
            <div class="mb-3 row">
                <div class="col-lg-1">
                    <p style="margin-top: 3px;">
                        Artist:
                    </p>
                </div>
                <div class="col-lg-11">
                    <div id="artistForm" class="input-group input-group-sm mb-3">
                        <select
                            v-model="selectedArtist"
                            class="form-select"
                        >
                            <option value="" disabled>
                                Select an artist
                            </option>
                            <option value="-" disabled>
                                ---
                            </option>
                            <option
                                v-for="featuredArtist in featuredArtists"
                                :key="featuredArtist.id"
                                :value="featuredArtist.id"
                            >
                                {{ featuredArtist.label }}
                            </option>
                        </select>
                        <button id="artistButton" class="btn btn-outline-info" @click="setArtist($event)">
                            Load songs
                        </button>
                    </div>
                </div>

                <div class="col-lg-1">
                    <p style="margin-top: 3px;">
                        Song:
                    </p>
                </div>
                <div class="col-lg-11">
                    <select
                        v-model="selectedSong"
                        class="form-select form-select-sm"
                        :disabled="!featuredSongs.length"
                    >
                        <option value="" disabled>
                            Select an artist to view songs
                        </option>
                        <option value="-" disabled>
                            ---
                        </option>
                        <option v-for="featuredSong in featuredSongs" :key="featuredSong.id" :value="featuredSong.id">
                            {{ featuredSong.title }} --- ({{ featuredSong.artist }})
                        </option>
                    </select>
                </div>
            </div>

            <p>
                Game-mode:
            </p>
            <div class="mb-3 row">
                <div class="col-sm-10">
                    <div
                        v-for="mode in modes"
                        :key="mode.value"
                        class="form-check form-check-inline"
                    >
                        <input
                            :id="mode.value"
                            v-model="selectedMode"
                            class="form-check-input"
                            type="radio"
                            :value="mode.value"
                        >
                        <label class="form-check-label" :for="mode.value">
                            {{ mode.name }}
                        </label>
                    </div>
                    <br><small class="text-white-50">If you want a hybrid mapset, change this later.</small>
                </div>
            </div>

            <p>
                Select one or more difficulties <i>you plan on mapping</i>. These can be changed later:
            </p>
            <div class="mb-3 row">
                <div class="col-sm-10">
                    <div
                        v-for="task in tasks"
                        :key="task"
                        class="form-check"
                    >
                        <input
                            :id="task"
                            v-model="checkedTasks"
                            class="form-check-input"
                            type="checkbox"
                            :value="task"
                        >
                        <label class="form-check-label" :for="task">
                            {{ task }}
                        </label>
                    </div>
                </div>
            </div>

            <p>
                Select one or more difficulties <i>you don't want anyone else to claim</i>. These can be changed later: <br>
                <small class="text-white-50">For example, if you don't want any guest difficulties, you should mark everything.</small>
            </p>
            <div class="mb-3 row">
                <div class="col-sm-10">
                    <div
                        v-for="task in tasks"
                        :key="task"
                        class="form-check"
                    >
                        <input
                            :id="`lock-${task}`"
                            v-model="checkedLocks"
                            class="form-check-input"
                            type="checkbox"
                            :value="task"
                        >
                        <label class="form-check-label" :for="`lock-${task}`">
                            {{ task }}
                        </label>
                    </div>
                </div>
            </div>
        </div>

        <div class="radial-divisor" />

        <button type="submit" class="btn btn-outline-success w-100" @click="saveNewMap($event)">
            Save
        </button>
    </modal-dialog>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { FeaturedSong } from '@interfaces/featuredSong';
import { FeaturedArtist } from '@interfaces/featuredArtist';
import { Beatmap } from '@interfaces/beatmap/beatmap';
import ModalDialog from '@components/ModalDialog.vue';

export default defineComponent({
    name: 'CreateBeatmapModal',
    components: {
        ModalDialog,
    },
    props: {
        isSecret: Boolean,
    },
    data () {
        return {
            featuredArtists: [] as FeaturedArtist[],
            featuredSongs: [] as FeaturedSong[],
            selectedArtist: '',
            selectedSong: '',
            selectedMode: 'osu',
            checkedTasks: [],
            checkedLocks: [],
            modes: [
                { value: 'osu', name: 'osu!' },
                { value: 'taiko', name: 'osu!taiko' },
                { value: 'catch', name: 'osu!catch' },
                { value: 'mania', name: 'osu!mania' },
            ],
            tasks: ['Easy', 'Normal', 'Hard', 'Insane', 'Expert'],
        };
    },
    async created () {
        const res: any = await this.$http.executeGet<FeaturedArtist[]>(`/featuredArtists/${this.isSecret ? 'showcase' : ''}`);

        if (res) {
            this.featuredArtists = res.sort((a, b) => {
                if (a.label.toLowerCase() > b.label.toLowerCase()) return 1;
                if (b.label.toLowerCase() > a.label.toLowerCase()) return -1;

                return 0;
            });
        }
    },
    methods: {
        async setArtist(e): Promise<void> {
            if (!this.selectedArtist) {
                this.$store.dispatch('updateToastMessages', {
                    message: 'Select an artist!',
                    type: 'info',
                });

                return;
            }

            e.target.disabled = true;
            const res: any = await this.$http.executeGet<FeaturedSong[]>(`/featuredArtists/${this.selectedArtist}/${this.isSecret ? 'showcaseSongs' : 'songs'}`);

            if (res) {
                this.featuredSongs = res.sort((a,b) => {
                    if (a.title.toLowerCase() > b.title.toLowerCase()) return 1;
                    if (b.title.toLowerCase() > a.title.toLowerCase()) return -1;

                    return 0;
                });
            }

            e.target.disabled = false;
        },
        async saveNewMap (e): Promise<void> {
            if (!this.selectedSong) {
                this.$store.dispatch('updateToastMessages', {
                    message: 'Select a song!',
                    type: 'info',
                });

                return;
            }

            const beatmap = await this.$http.executePost<Beatmap>('/beatmaps/create/', {
                song: this.selectedSong,
                tasks: this.checkedTasks,
                tasksLocked: this.checkedLocks,
                mode: this.selectedMode,
                status: this.isSecret ? 'Secret' : 'WIP',
            }, e);

            if (!this.$http.isError(beatmap)) {
                this.$bs.hideModal('addBeatmap');
                this.$store.commit('beatmaps/addBeatmap', beatmap);
            }
        },
    },
});
</script>
