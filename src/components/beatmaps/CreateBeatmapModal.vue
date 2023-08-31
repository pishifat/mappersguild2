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
                            <option value="">
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
                        <input
                            v-model="artistInput"
                            type="text"
                            class="form-control"
                            placeholder="or input the artist's name..."
                            @keyup.enter="setArtist($event)"
                        />
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

            <hr />

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
                        />
                        <label class="form-check-label" :for="mode.value">
                            {{ mode.name }}
                        </label>
                    </div>
                    <br />
                </div>
            </div>

            <hr />

            <div class="mb-2">
                Set your mapset's difficulties
                <div class="small text-secondary">
                    These can be changed later.
                </div>
            </div>

            <table v-if="tempTasks.length" class="table table-sm">
                <thead>
                    <tr>
                        <th>Difficulty</th>
                        <th>Mapper(s)</th>
                        <th>Status</th>
                        <th />
                    </tr>
                </thead>
                <transition-group tag="tbody" name="list">
                    <tr v-for="task in tempTasks" :key="task.random">
                        <!-- difficulty -->
                        <td
                            class="text-secondary"
                        >
                            {{ task.name }}
                            <template v-if="selectedMode == 'hybrid'">
                                <modes-icons :modes="[task.mode]" />
                            </template>
                        </td>

                        <!-- mappers -->
                        <td>
                            <user-link-list
                                :users="task.mappers"
                            />
                        </td>

                        <!-- status -->
                        <td :class="task.status == 'WIP' ? 'text-wip' : 'text-success'">
                            {{ task.status }}
                        </td>
                        <!-- actions -->
                        <td>
                            <a
                                v-bs-tooltip="'delete'"
                                href="#"
                                class="text-danger"
                                @click="removeTempTask(task.random)"
                            >
                                <i class="fas fa-times" />
                            </a>
                        </td>
                    </tr>
                </transition-group>
            </table>

            <div class="col-sm-12">
                <div class="input-group input-group-sm mx-auto">
                    <select
                        v-model="newTaskName"
                        class="form-select"
                    >
                        <option
                            value=""
                            disabled
                            selected
                        >
                            Select a task
                        </option>
                        <option
                            v-for="task in tasks"
                            :key="task"
                            :value="task"
                        >
                            {{ task }}
                        </option>
                    </select>

                    <select
                        v-if="selectedMode == 'hybrid'"
                        v-model="selectedTaskMode"
                        class="form-select"
                    >
                        <option value="osu">
                            osu!
                        </option>
                        <option value="taiko">
                            osu!taiko
                        </option>
                        <option value="catch">
                            osu!catch
                        </option>
                        <option value="mania">
                            osu!mania
                        </option>
                    </select>

                    <select
                        v-model="selectedTaskStatus"
                        class="form-select"
                    >
                        <option
                            value=""
                            disabled
                            selected
                        >
                            Select a status
                        </option>
                        <option value="WIP">
                            Work-in-progress
                        </option>
                        <option value="Done">
                            Done
                        </option>
                    </select>

                    <input
                        v-model="newTaskMapper"
                        class="form-control"
                        type="text"
                        placeholder="mapper name or osu! ID..."
                        @keyup.enter="addTempTask($event)"
                    />

                    <button
                        v-bs-tooltip="'add difficulty'"
                        class="btn btn-outline-info"
                        @click="addTempTask($event)"
                    >
                        <i class="fas fa-plus" />
                    </button>
                </div>
                <div class="text-secondary small mt-1">
                    <ul class="small">
                        <li>You can leave the "mapper" field empty for your own difficulties.</li>
                        <li>Use comma separation for collabs, like "mapper1, mapper2"</li>
                    </ul>
                </div>
            </div>

            <hr />

            <div class="mb-2">
                Set any difficulties that nobody else is allowed to claim.
                <div class="small text-secondary">
                    For example, if you don't want any guest difficulties, you should select all. These can be changed later.
                </div>
            </div>
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
                        />
                        <label class="form-check-label" :for="`lock-${task}`">
                            {{ task }}
                        </label>
                    </div>
                </div>
            </div>
        </div>

        <button type="submit" class="btn btn-outline-success w-100" @click="saveNewMap($event)">
            Create beatmap
        </button>

        <div class="radial-divisor" />

        <div class="small text-secondary mt-2">
            <div class="small">
                Note that you can only earn points for beatmaps that fit these requirements:
                <ul>
                    <li>Your beatmap was ranked <i>after</i> you joined the Mappers' Guild (<code>{{ loggedInUser.createdAt }}</code>)</li>
                    <li>Your beatmap was ranked <i>after</i> the Featured Artist was announced, excluding maps created for the announcement</li>
                    <li>Difficulties match between Mappers' Guild and osu! website (including difficulty levels and mappers)</li>
                    <li>Background does not contain content from other media franchises (like Ganyu from Genshin Impact), excluding creative commons content (like Hatsune Miku)</li>
                </ul>
            </div>
        </div>
    </modal-dialog>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { mapState } from 'vuex';
import { Task } from '@interfaces/beatmap/task';
import { User } from '@interfaces/user';
import { FeaturedSong } from '@interfaces/featuredSong';
import { FeaturedArtist } from '@interfaces/featuredArtist';
import { Beatmap, BeatmapStatus } from '@interfaces/beatmap/beatmap';
import ModalDialog from '@components/ModalDialog.vue';
import ModesIcons from '@components/ModesIcons.vue';
import UserLinkList from '@components/UserLinkList.vue';

export default defineComponent({
    name: 'CreateBeatmapModal',
    components: {
        ModalDialog,
        UserLinkList,
        ModesIcons,
    },
    data () {
        return {
            featuredArtists: [] as FeaturedArtist[],
            featuredSongs: [] as FeaturedSong[],
            selectedArtist: '',
            artistInput: '',
            selectedSong: '',
            selectedMode: 'osu',
            selectedTaskStatus: '',
            previousSelectedMode: '',
            selectedTaskMode: 'osu',
            checkedLocks: [],
            modes: [
                { value: 'osu', name: 'osu!' },
                { value: 'taiko', name: 'osu!taiko' },
                { value: 'catch', name: 'osu!catch' },
                { value: 'mania', name: 'osu!mania' },
                { value: 'hybrid', name: 'Multiple modes' },
            ],
            tasks: ['Easy', 'Normal', 'Hard', 'Insane', 'Expert', 'Storyboard'],
            newTaskName: '',
            newTaskMapper: '',
            tempTasks: [] as any,
        };
    },
    computed: {
        ...mapState([
            'loggedInUser',
        ]),
        sortedTasks(): Task[] {
            const difficultyOrder = ['Easy', 'Normal', 'Hard', 'Insane', 'Expert', 'Storyboard'];
            const modeOrder = ['osu', 'taiko', 'catch', 'mania', 'sb'];

            const newTasks: any = [...this.tempTasks].sort(function(a, b) {
                return difficultyOrder.indexOf(a.name) - difficultyOrder.indexOf(b.name);
            });

            return newTasks.sort(function(a, b) {
                return modeOrder.indexOf(a.mode) - modeOrder.indexOf(b.mode);
            });
        },
    },
    watch: {
        selectedMode() {
            if (this.selectedMode == 'hybrid') {
                this.tempTasks = [];
            }

            if (this.previousSelectedMode == 'hybrid') {
                this.tempTasks = [];
            }

            this.previousSelectedMode = this.selectedMode;
        },
    },
    async created () {
        const res: any = await this.$http.executeGet<FeaturedArtist[]>(`/featuredArtists`);

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
            if (!this.selectedArtist && !this.artistInput) {
                this.$store.dispatch('updateToastMessages', {
                    message: 'Select or type an artist!',
                    type: 'danger',
                });

                return;
            }

            if (this.artistInput) {
                const artist = this.featuredArtists.find(a => a.label.toLowerCase().includes(this.artistInput.toLowerCase()));

                if (artist) {
                    this.selectedArtist = artist.id;
                }
            }

            if (!this.selectedArtist) {
                this.$store.dispatch('updateToastMessages', {
                    message: `Couldn't find artist! Check your typing or select one from the list.`,
                    type: 'danger',
                });

                return;
            }

            e.target.disabled = true;

            const res: any = await this.$http.executeGet<FeaturedSong[]>(`/featuredArtists/${this.selectedArtist}/songs`);

            if (res) {
                this.featuredSongs = res.sort((a,b) => {
                    if (a.title.toLowerCase() > b.title.toLowerCase()) return 1;
                    if (b.title.toLowerCase() > a.title.toLowerCase()) return -1;

                    return 0;
                });
            }

            e.target.disabled = false;
        },
        async addTempTask(e): Promise<void> {
            if (!this.newTaskName.length || !this.selectedTaskStatus.length) {
                this.$store.dispatch('updateToastMessages', {
                    message: 'Missing task or status',
                    type: 'danger',
                });

                return;
            }

            const finalUsers: any = await this.$http.executeGet<User[]>(`/beatmaps/validateUsers/${this.newTaskMapper.length ? this.newTaskMapper : this.loggedInUser.username}`, e);

            if (finalUsers && finalUsers.length) {
                this.tempTasks.push({
                    name: this.newTaskName,
                    mappers: finalUsers,
                    mode: this.selectedTaskMode,
                    status: this.selectedTaskStatus,
                    random: Math.random().toString(),
                });
            }
        },
        removeTempTask(random): void {
            const i = this.tempTasks.findIndex(t => t.random == random);
            this.tempTasks.splice(i, 1);
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
                tasks: this.tempTasks,
                tasksLocked: this.checkedLocks,
                mode: this.selectedMode,
            }, e);

            if (!this.$http.isError(beatmap)) {
                this.$bs.hideModal('addBeatmap');
                this.$store.commit('beatmaps/addBeatmap', beatmap);
            }
        },
    },
});
</script>

<style scoped>
.fake-button-disable {
    pointer-events: none;
    opacity: 0.6;
}
</style>