<template>
    <modal-dialog id="editMission" modal-size="xl">
        <template #header>
            {{ mission.name }} ({{ mission.id }})
        </template>

        <div class="container ">
            <!-- name -->
            <div class="row mt-2 d-flex align-items-center">
                <div class="col-sm-2">
                    Name
                </div>
                <div class="col-sm-6">
                    <input
                        v-model="name"
                        class="form-control form-control-sm"
                        type="text"
                        autocomplete="off"
                        placeholder="mission name..."
                    />
                </div>
                <div class="col-sm-4">
                    <button class="btn btn-sm btn-outline-info w-100" @click="updateName($event)">
                        Rename
                    </button>
                </div>
            </div>
            <!-- tier -->
            <div class="row mt-2 d-flex align-items-center">
                <div class="col-sm-2">
                    Tier
                </div>
                <div class="col-sm-6">
                    <input
                        v-model="tier"
                        class="form-control form-control-sm"
                        type="text"
                        autocomplete="off"
                        placeholder="tier..."
                    />
                </div>
                <div class="col-sm-4">
                    <button class="btn btn-sm btn-outline-info w-100" @click="updateTier($event)">
                        Update tier
                    </button>
                </div>
            </div>
            <!-- objective -->
            <div class="row mt-2 d-flex align-items-center">
                <div class="col-sm-2">
                    Objective
                </div>
                <div class="col-sm-6">
                    <textarea
                        v-model="objective"
                        class="form-control form-control-sm"
                        type="text"
                        autocomplete="off"
                        placeholder="mission objective..."
                    />
                </div>
                <div class="col-sm-4">
                    <button class="btn btn-sm btn-outline-info w-100" @click="updateObjective($event)">
                        Update objective
                    </button>
                </div>
            </div>
            <!-- win condition -->
            <div class="row mt-2 d-flex align-items-center">
                <div class="col-sm-2">
                    Win condition
                </div>
                <div class="col-sm-6">
                    <textarea
                        v-model="winCondition"
                        class="form-control form-control-sm"
                        type="text"
                        autocomplete="off"
                        placeholder="mission win condition..."
                    />
                </div>
                <div class="col-sm-4">
                    <button class="btn btn-sm btn-outline-info w-100" @click="updateWinCondition($event)">
                        Update win condition
                    </button>
                </div>
            </div>

            <!-- status -->
            <div class="row mt-2 d-flex align-items-center">
                <div class="col-sm-2">
                    Status
                </div>
                <div class="col-sm-6">
                    <select
                        v-model="status"
                        class="form-select form-select-sm"
                    >
                        <option value="" disabled>
                            Select a status
                        </option>
                        <option value="hidden">
                            Hidden
                        </option>
                        <option value="open">
                            Open
                        </option>
                        <option value="closed">
                            Closed
                        </option>
                    </select>
                </div>
                <div class="col-sm-4">
                    <button class="btn btn-sm btn-outline-info w-100" @click="updateStatus($event)">
                        Update status
                    </button>
                </div>
            </div>

            <!-- modes -->
            <div class="row mt-2 d-flex align-items-center">
                <div class="col-sm-2">
                    Mode
                </div>
                <div class="col-sm-2">
                    <select
                        v-model="mode"
                        class="form-select form-select-sm"
                    >
                        <option value="" disabled>
                            Select a mode
                        </option>
                        <option v-for="aMode in availableModes" :key="aMode">
                            {{ aMode }}
                        </option>
                    </select>
                </div>
                <div class="col-sm-4">
                    <div class="small text-secondary">
                        Current: <b>{{ mission.modes }}</b>
                    </div>
                </div>
                <div class="col-sm-4">
                    <button class="btn btn-sm btn-outline-info w-100" @click="toggleMode($event)">
                        Toggle mode
                    </button>
                </div>
            </div>

            <!-- artists -->
            <div v-if="availableArtists" class="row mt-2 d-flex align-items-center">
                <div class="col-sm-2">
                    Artists
                </div>
                <div class="col-sm-2">
                    <select
                        v-model="selectedArtist"
                        class="form-select form-select-sm"
                    >
                        <option :value="{}" disabled>
                            Select an artist
                        </option>
                        <option v-for="artist in availableArtists" :key="artist.id">
                            {{ artist.label }}
                        </option>
                    </select>
                </div>
                <div class="col-sm-4">
                    <div class="small text-secondary">
                        Current: <b>{{ mission.artists.map(a => a.label) }}</b>
                    </div>
                </div>
                <div class="col-sm-4">
                    <button class="btn btn-sm btn-outline-info w-100" @click="toggleArtist($event)">
                        Toggle artist
                    </button>
                </div>
            </div>

            <!-- deadline -->
            <div class="row mt-2 d-flex align-items-center">
                <div class="col-sm-2">
                    Deadline
                </div>
                <div class="col-sm-2">
                    <input
                        v-model="deadline"
                        class="form-control form-control-sm"
                        type="date"
                        autocomplete="off"
                        placeholder="deadline..."
                    />
                </div>
                <div class="col-sm-4 small text-secondary">
                    Current: <b>{{ mission.deadline }}</b>
                </div>
                <div class="col-sm-4">
                    <button class="btn btn-sm btn-outline-info w-100" @click="updateDeadline($event)">
                        Update deadline
                    </button>
                </div>
            </div>

            <!-- isShowcaseMission -->
            <div class="row d-flex mt-2 align-items-center">
                <div class="col-sm-4">
                    isShowcaseMission
                </div>
                <div class="col-sm-4 small text-secondary">
                    Current: <b :class="mission.isShowcaseMission ? 'text-success' : 'text-danger'">{{ mission.isShowcaseMission ? mission.isShowcaseMission : 'false' }}</b>
                </div>
                <div class="col-sm-4">
                    <button class="btn btn-sm btn-outline-info w-100" @click="toggleIsShowcaseMission($event)">
                        Toggle isShowcaseMission
                    </button>
                </div>
            </div>
            <!-- isArtistShowcase -->
            <div class="row d-flex mt-2 align-items-center">
                <div class="col-sm-4">
                    isArtistShowcase
                </div>
                <div class="col-sm-4 small text-secondary">
                    Current: <b :class="mission.isArtistShowcase ? 'text-success' : 'text-danger'">{{ mission.isArtistShowcase ? mission.isArtistShowcase : 'false' }}</b>
                </div>
                <div class="col-sm-4">
                    <button class="btn btn-sm btn-outline-info w-100" @click="toggleIsArtistShowcase($event)">
                        Toggle isArtistShowcase
                    </button>
                </div>
            </div>
            <!-- isSeparate -->
            <div class="row d-flex mt-2 align-items-center">
                <div class="col-sm-4">
                    isSeparate
                </div>
                <div class="col-sm-4 small text-secondary">
                    Current: <b :class="mission.isSeparate ? 'text-success' : 'text-danger'">{{ mission.isSeparate ? mission.isSeparate : 'false' }}</b>
                </div>
                <div class="col-sm-4">
                    <button class="btn btn-sm btn-outline-info w-100" @click="toggleIsSeparate($event)">
                        Toggle isSeparate
                    </button>
                </div>
            </div>
            <!-- remainingArtists -->
            <div class="row mt-2 d-flex align-items-center">
                <div class="col-sm-2">
                    remainingArtists
                </div>
                <div class="col-sm-2">
                    <input
                        v-model="remainingArtists"
                        class="form-control form-control-sm"
                        type="text"
                        autocomplete="off"
                        placeholder="remaining artists..."
                    />
                </div>
                <div class="col-sm-4 small text-secondary">
                    Current: <b>{{ mission.remainingArtists }}</b>
                </div>
                <div class="col-sm-4">
                    <button class="btn btn-sm btn-outline-info w-100" @click="updateRemainingArtists($event)">
                        Update remainingArtists
                    </button>
                </div>
            </div>
            <!-- openingAnnounced -->
            <div class="row d-flex mt-2 align-items-center">
                <div class="col-sm-4">
                    Opening announced
                </div>
                <div class="col-sm-4 small text-secondary">
                    Current: <b :class="mission.openingAnnounced ? 'text-success' : 'text-danger'">{{ mission.openingAnnounced }}</b>
                </div>
                <div class="col-sm-4">
                    <button class="btn btn-sm btn-outline-info w-100" @click="toggleOpeningAnnounced($event)">
                        Toggle openingAnnounced
                    </button>
                </div>
            </div>
            <!-- closingAnnounced -->
            <div class="row d-flex mt-2 align-items-center">
                <div class="col-sm-4">
                    Closing announced
                </div>
                <div class="col-sm-4 small text-secondary">
                    Current: <b :class="mission.closingAnnounced ? 'text-success' : 'text-danger'">{{ mission.closingAnnounced }}</b>
                </div>
                <div class="col-sm-4">
                    <button class="btn btn-sm btn-outline-info w-100" @click="toggleClosingAnnounced($event)">
                        Toggle closingAnnounced
                    </button>
                </div>
            </div>

            <!-- user reqiurements -->
            <hr />
            <h5>User requirements</h5>

            <!-- max ranked maps -->
            <div class="row d-flex mt-2 align-items-center">
                <div class="col-sm-2">
                    Max. ranked maps
                </div>
                <div class="col-sm-2">
                    <input
                        v-model="userMaximumRankedBeatmapsCount"
                        class="form-control form-control-sm"
                        type="text"
                        autocomplete="off"
                        placeholder="max ranked maps..."
                    />
                </div>
                <div class="col-sm-4 small text-secondary">
                    Includes: <b>label, validation</b>
                </div>
                <div class="col-sm-4">
                    <button class="btn btn-sm btn-outline-info w-100" @click="updateUserMaximumRankedBeatmapsCount($event)">
                        Update user max ranked maps count
                    </button>
                </div>
            </div>
            <!-- max global rank -->
            <div class="row d-flex mt-2 align-items-center">
                <div class="col-sm-2">
                    Max. global rank
                </div>
                <div class="col-sm-2">
                    <input
                        v-model="userMaximumGlobalRank"
                        class="form-control form-control-sm"
                        type="number"
                        autocomplete="off"
                        placeholder="max global rank..."
                    />
                </div>
                <div class="col-sm-4 small text-secondary">
                    Includes: <b>label, validation</b>
                </div>
                <div class="col-sm-4">
                    <button class="btn btn-sm btn-outline-info w-100" @click="updateUserMaximumGlobalRank($event)">
                        Update user max global rank
                    </button>
                </div>
            </div>
            <!-- max pp -->
            <div class="row d-flex mt-2 align-items-center">
                <div class="col-sm-2">
                    Max. pp
                </div>
                <div class="col-sm-2">
                    <input
                        v-model="userMaximumPp"
                        class="form-control form-control-sm"
                        type="number"
                        autocomplete="off"
                        placeholder="max pp..."
                    />
                </div>
                <div class="col-sm-4 small text-secondary">
                    Includes: <b>label, validation</b>
                </div>
                <div class="col-sm-4">
                    <button class="btn btn-sm btn-outline-info w-100" @click="updateUserMaximumPp($event)">
                        Update user max pp
                    </button>
                </div>
            </div>
            <!-- min pp -->
            <div class="row d-flex mt-2 align-items-center">
                <div class="col-sm-2">
                    Min. pp
                </div>
                <div class="col-sm-2">
                    <input
                        v-model="userMinimumPp"
                        class="form-control form-control-sm"
                        type="number"
                        autocomplete="off"
                        placeholder="min pp..."
                    />
                </div>
                <div class="col-sm-4 small text-secondary">
                    Includes: <b>label, validation</b>
                </div>
                <div class="col-sm-4">
                    <button class="btn btn-sm btn-outline-info w-100" @click="updateUserMinimumPp($event)">
                        Update user min pp
                    </button>
                </div>
            </div>
            <!-- min mg rank -->
            <div class="row d-flex mt-2 align-items-center">
                <div class="col-sm-2">
                    Min. MG rank
                </div>
                <div class="col-sm-2">
                    <input
                        v-model="userMinimumRank"
                        class="form-control form-control-sm"
                        type="number"
                        autocomplete="off"
                        placeholder="min mg rank..."
                    />
                </div>
                <div class="col-sm-4 small text-secondary">
                    Includes: <b>label, validation</b>
                </div>
                <div class="col-sm-4">
                    <button class="btn btn-sm btn-outline-info w-100" @click="updateUserMinimumRank($event)">
                        Update user min rank
                    </button>
                </div>
            </div>
            <!-- beatmap reqiurements -->
            <hr />
            <h5>Beatmap requirements</h5>
            <!-- earliest submission date -->
            <div class="row d-flex mt-2 align-items-center">
                <div class="col-sm-2">
                    Earliest submission date
                </div>
                <div class="col-sm-2">
                    <input
                        v-model="beatmapEarliestSubmissionDate"
                        class="form-control form-control-sm"
                        type="date"
                        autocomplete="off"
                        placeholder="earliest submission date allowed..."
                    />
                </div>
                <div class="col-sm-4 small text-secondary">
                    <div>Includes: <b>label, validation</b> (if &gt;2007)</div>
                    <div>Current: <b>{{ mission.beatmapEarliestSubmissionDate }}</b></div>
                </div>
                <div class="col-sm-4">
                    <button class="btn btn-sm btn-outline-info w-100" @click="updateBeatmapEarliestSubmissionDate($event)">
                        Update beatmap earliest submission date
                    </button>
                </div>
            </div>
            <!-- latest submission date -->
            <div class="row d-flex mt-2 align-items-center">
                <div class="col-sm-2">
                    Latest submission date
                </div>
                <div class="col-sm-2">
                    <input
                        v-model="beatmapLatestSubmissionDate"
                        class="form-control form-control-sm"
                        type="date"
                        autocomplete="off"
                        placeholder="latest submission date allowed..."
                    />
                </div>
                <div class="col-sm-4 small text-secondary">
                    <div>Includes: <b>label, validation</b> (if &lt;2050)</div>
                    <div>Current: <b>{{ mission.beatmapLatestSubmissionDate }}</b></div>
                </div>
                <div class="col-sm-4">
                    <button class="btn btn-sm btn-outline-info w-100" @click="updateBeatmapLatestSubmissionDate($event)">
                        Update beatmap latest submission date
                    </button>
                </div>
            </div>
            <!-- min favorites -->
            <div class="row d-flex mt-2 align-items-center">
                <div class="col-sm-2">
                    Min. favorites
                </div>
                <div class="col-sm-2">
                    <input
                        v-model="beatmapMinimumFavorites"
                        class="form-control form-control-sm"
                        type="number"
                        autocomplete="off"
                        placeholder="min favorites..."
                    />
                </div>
                <div class="col-sm-4 small text-secondary">
                    <div>Includes: <b>label, validation</b> (if min. playcount exists)</div>
                </div>
                <div class="col-sm-4">
                    <button class="btn btn-sm btn-outline-info w-100" @click="updateBeatmapMinimumFavorites($event)">
                        Update beatmap minimum favorites
                    </button>
                </div>
            </div>
            <!-- min playcount -->
            <div class="row d-flex mt-2 align-items-center">
                <div class="col-sm-2">
                    Min. playcount
                </div>
                <div class="col-sm-2">
                    <input
                        v-model="beatmapMinimumPlayCount"
                        class="form-control form-control-sm"
                        type="number"
                        autocomplete="off"
                        placeholder="min playcount..."
                    />
                </div>
                <div class="col-sm-4 small text-secondary">
                    <div>Includes: <b>label, validation</b> (if min. favorites exists)</div>
                </div>
                <div class="col-sm-4">
                    <button class="btn btn-sm btn-outline-info w-100" @click="updateBeatmapMinimumPlayCount($event)">
                        Update beatmap minimum playcount
                    </button>
                </div>
            </div>
            <!-- difficulties -->
            <div class="row mt-2 d-flex align-items-center">
                <div class="col-sm-2">
                    Difficulties
                </div>
                <div class="col-sm-2">
                    <select
                        v-model="selectedDifficulty"
                        class="form-select form-select-sm"
                    >
                        <option value="" disabled>
                            Select a difficulty
                        </option>
                        <option v-for="difficulty in difficulties" :key="difficulty">
                            {{ difficulty }}
                        </option>
                    </select>
                </div>
                <div class="col-sm-4">
                    <div class="small text-secondary">
                        Current: <b>{{ sortedTasks.join(', ') }}</b>
                    </div>
                </div>
                <div class="col-sm-4">
                    <button class="btn btn-sm btn-outline-info w-100" @click="toggleDifficulty($event)">
                        Toggle difficulty
                    </button>
                </div>
            </div>
            <!-- min length -->
            <div class="row d-flex mt-2 align-items-center">
                <div class="col-sm-2">
                    Min. length
                </div>
                <div class="col-sm-2">
                    <input
                        v-model="beatmapMinimumLength"
                        class="form-control form-control-sm"
                        type="number"
                        autocomplete="off"
                        placeholder="min length..."
                    />
                </div>
                <div class="col-sm-4 small text-secondary">
                    <div>Includes: <b>label</b></div>
                </div>
                <div class="col-sm-4">
                    <button class="btn btn-sm btn-outline-info w-100" @click="updateBeatmapMinimumLength($event)">
                        Update beatmap minimum length
                    </button>
                </div>
            </div>
            <!-- max length -->
            <div class="row d-flex mt-2 align-items-center">
                <div class="col-sm-2">
                    Max. length
                </div>
                <div class="col-sm-2">
                    <input
                        v-model="beatmapMaximumLength"
                        class="form-control form-control-sm"
                        type="number"
                        autocomplete="off"
                        placeholder="max length..."
                    />
                </div>
                <div class="col-sm-4 small text-secondary">
                    <div>Includes: <b>label</b></div>
                </div>
                <div class="col-sm-4">
                    <button class="btn btn-sm btn-outline-info w-100" @click="updateBeatmapMaximumLength($event)">
                        Update beatmap maximum length
                    </button>
                </div>
            </div>
            <!-- isUniqueToRanked -->
            <div class="row d-flex mt-2 align-items-center">
                <div class="col-sm-4">
                    isUniqueToRanked
                </div>
                <div class="col-sm-4 small text-secondary">
                    <div>Includes: <b>label</b></div>
                    <div>
                        Current: <b :class="mission.isUniqueToRanked ? 'text-success' : 'text-danger'">{{ mission.isUniqueToRanked ? mission.isUniqueToRanked : 'false' }}</b>
                    </div>
                </div>
                <div class="col-sm-4">
                    <button class="btn btn-sm btn-outline-info w-100" @click="toggleIsUniqueToRanked($event)">
                        Toggle isUniqueToRanked
                    </button>
                </div>
            </div>
            <!-- additional requirement -->
            <div class="row d-flex mt-2 align-items-center">
                <div class="col-sm-2">
                    Additional req
                </div>
                <div class="col-sm-2">
                    <input
                        v-model="additionalRequirement"
                        class="form-control form-control-sm"
                        type="text"
                        autocomplete="off"
                        placeholder="additional requirement..."
                    />
                </div>
                <div class="col-sm-4 small text-secondary">
                    <div>Includes: <b>label</b></div>
                </div>
                <div class="col-sm-4">
                    <button class="btn btn-sm btn-outline-info w-100" @click="updateAdditionalRequirement($event)">
                        Update additional requirement
                    </button>
                </div>
            </div>
            <hr />
            <!-- associated beatmaps -->
            <associated-beatmaps
                v-if="mission.associatedMaps && mission.associatedMaps.length"
                class="my-4"
                :mission="mission"
                :is-admin-page="true"
            />
        </div>
    </modal-dialog>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import ModalDialog from '@components/ModalDialog.vue';
import AssociatedBeatmaps from '@components/missions/AssociatedBeatmaps.vue';
import { FeaturedArtist } from '@interfaces/featuredArtist';
import { Mission, MissionMode } from '@interfaces/mission';
import { SortedTasks } from '@interfaces/beatmap/task';

export default defineComponent({
    name: 'MissionInfo',
    components: {
        AssociatedBeatmaps,
        ModalDialog,
    },
    props: {
        mission: {
            type: Object as () => Mission,
            required: true,
        },
    },
    data() {
        return {
            availableArtists: [] as FeaturedArtist[],
            availableModes: MissionMode,
            selectedArtist: {} as FeaturedArtist,
            selectedDifficulty: '',
            name: this.mission.name,
            tier: this.mission.tier,
            objective: this.mission.objective,
            winCondition: this.mission.winCondition,
            status: this.mission.status,
            mode: '',
            artists: this.mission.artists,
            deadline: new Date(this.mission.deadline),
            remainingArtists: this.mission.remainingArtists,
            userMaximumRankedBeatmapsCount: this.mission.userMaximumRankedBeatmapsCount,
            userMaximumGlobalRank: this.mission.userMaximumGlobalRank,
            userMaximumPp: this.mission.userMaximumPp,
            userMinimumPp: this.mission.userMinimumPp,
            userMinimumRank: this.mission.userMinimumRank,
            beatmapEarliestSubmissionDate: new Date(this.mission.beatmapEarliestSubmissionDate),
            beatmapLatestSubmissionDate: new Date(this.mission.beatmapLatestSubmissionDate),
            beatmapMinimumFavorites: this.mission.beatmapMinimumFavorites,
            beatmapMinimumPlayCount: this.mission.beatmapMinimumPlayCount,
            beatmapMinimumLength: this.mission.beatmapMinimumLength,
            beatmapMaximumLength: this.mission.beatmapMaximumLength,
            isUniqueToRanked: this.mission.isUniqueToRanked,
            additionalRequirement: this.mission.additionalRequirement,
            difficulties: ['Easy', 'Normal', 'Hard', 'Insane', 'Expert'],
        };
    },
    computed: {
        sortedTasks(): string[] {
            const sortOrder = SortedTasks;

            return [...this.mission.beatmapDifficulties].sort(function(a, b) {
                return sortOrder.indexOf(a) - sortOrder.indexOf(b);
            });
        },
    },
    watch: {
        mission(): void {
            this.name = this.mission.name;
            this.tier = this.mission.tier;
            this.objective = this.mission.objective;
            this.winCondition = this.mission.winCondition;
            this.status = this.mission.status;
            this.mode = '';
            this.artists = this.mission.artists;
            this.deadline = new Date(this.mission.deadline);
            this.remainingArtists = this.mission.remainingArtists;
            this.userMaximumRankedBeatmapsCount = this.mission.userMaximumRankedBeatmapsCount;
            this.userMaximumGlobalRank = this.mission.userMaximumGlobalRank;
            this.userMaximumPp = this.mission.userMaximumPp;
            this.userMinimumPp = this.mission.userMinimumPp;
            this.userMinimumRank = this.mission.userMinimumRank;
            this.beatmapEarliestSubmissionDate = new Date(this.mission.beatmapEarliestSubmissionDate);
            this.beatmapLatestSubmissionDate = new Date(this.mission.beatmapLatestSubmissionDate);
            this.beatmapMinimumFavorites = this.mission.beatmapMinimumFavorites;
            this.beatmapMinimumPlayCount = this.mission.beatmapMinimumPlayCount;
            this.beatmapMinimumLength = this.mission.beatmapMinimumLength;
            this.beatmapMaximumLength = this.mission.beatmapMaximumLength;
            this.isUniqueToRanked = this.mission.isUniqueToRanked;
            this.additionalRequirement = this.mission.additionalRequirement;
        },
    },
    async created () {
        const res: any = await this.$http.executeGet<FeaturedArtist[]>(`/featuredArtists`);

        if (res) {
            this.availableArtists = res.sort((a, b) => {
                if (a.label.toLowerCase() > b.label.toLowerCase()) return 1;
                if (b.label.toLowerCase() > a.label.toLowerCase()) return -1;

                return 0;
            });
        }
    },
    methods: {
        async updateName(e): Promise<void> {
            const name = await this.$http.executePost(`/admin/missions/${this.mission.id}/rename`, { name: this.name }, e);

            if (!this.$http.isError(name)) {
                this.$store.dispatch('updateToastMessages', {
                    message: `renamed mission`,
                    type: 'info',
                });
                this.$store.commit('updateName', {
                    missionId: this.mission.id,
                    name,
                });
            }
        },
        async updateTier(e): Promise<void> {
            const tier = await this.$http.executePost(`/admin/missions/${this.mission.id}/updateTier`, { tier: this.tier }, e);

            if (!this.$http.isError(tier)) {
                this.$store.dispatch('updateToastMessages', {
                    message: `updated tier`,
                    type: 'info',
                });
                this.$store.commit('updateTier', {
                    missionId: this.mission.id,
                    tier,
                });
            }
        },
        async updateObjective(e): Promise<void> {
            const objective = await this.$http.executePost(`/admin/missions/${this.mission.id}/updateObjective/`, { objective: this.objective }, e);

            if (!this.$http.isError(objective)) {
                this.$store.dispatch('updateToastMessages', {
                    message: `updated objective`,
                    type: 'info',
                });
                this.$store.commit('updateObjective', {
                    missionId: this.mission.id,
                    objective,
                });
            }
        },
        async updateWinCondition(e): Promise<void> {
            const winCondition = await this.$http.executePost(`/admin/missions/${this.mission.id}/updateWinCondition/`, { winCondition: this.winCondition }, e);

            if (!this.$http.isError(winCondition)) {
                this.$store.dispatch('updateToastMessages', {
                    message: `updated win condition`,
                    type: 'info',
                });
                this.$store.commit('updateWinCondition', {
                    missionId: this.mission.id,
                    winCondition,
                });
            }
        },
        async updateStatus(e): Promise<void> {
            const status = await this.$http.executePost(`/admin/missions/${this.mission.id}/updateStatus/`, { status: this.status }, e);

            if (!this.$http.isError(status)) {
                this.$store.dispatch('updateToastMessages', {
                    message: `updated status`,
                    type: 'info',
                });
                this.$store.commit('updateStatus', {
                    missionId: this.mission.id,
                    status,
                });
            }
        },
        async toggleMode(e): Promise<void> {
            const modes = await this.$http.executePost(`/admin/missions/${this.mission.id}/toggleMode/`, { mode: this.mode }, e);

            if (!this.$http.isError(modes)) {
                this.$store.dispatch('updateToastMessages', {
                    message: `toggled mode`,
                    type: 'info',
                });
                this.$store.commit('updateModes', {
                    missionId: this.mission.id,
                    modes,
                });
            }
        },
        async toggleArtist(e): Promise<void> {
            const artists = await this.$http.executePost(`/admin/missions/${this.mission.id}/toggleArtist/`, { artistLabel: this.selectedArtist }, e);

            if (!this.$http.isError(artists)) {
                this.$store.dispatch('updateToastMessages', {
                    message: `toggled artist`,
                    type: 'info',
                });
                this.$store.commit('updateArtists', {
                    missionId: this.mission.id,
                    artists,
                });
            }
        },
        async updateDeadline(e): Promise<void> {
            const deadline = await this.$http.executePost(`/admin/missions/${this.mission.id}/updateDeadline/`, { deadline: this.deadline }, e);

            if (!this.$http.isError(deadline)) {
                this.$store.dispatch('updateToastMessages', {
                    message: `updated deadline`,
                    type: 'info',
                });
                this.$store.commit('updateDeadline', {
                    missionId: this.mission.id,
                    deadline,
                });
            }
        },
        async toggleIsShowcaseMission(e): Promise<void> {
            const isShowcaseMission = await this.$http.executePost(`/admin/missions/${this.mission.id}/toggleIsShowcaseMission/`, { isShowcaseMission: !this.mission.isShowcaseMission }, e);

            if (!this.$http.isError(isShowcaseMission)) {
                this.$store.dispatch('updateToastMessages', {
                    message: `toggled isShowcaseMission`,
                    type: 'info',
                });
                this.$store.commit('updateIsShowcaseMission', {
                    missionId: this.mission.id,
                    isShowcaseMission,
                });
            }
        },
        async toggleIsArtistShowcase(e): Promise<void> {
            const isArtistShowcase = await this.$http.executePost(`/admin/missions/${this.mission.id}/toggleIsArtistShowcase/`, { isArtistShowcase: !this.mission.isArtistShowcase }, e);

            if (!this.$http.isError(isArtistShowcase)) {
                this.$store.dispatch('updateToastMessages', {
                    message: `toggled isArtistShowcase`,
                    type: 'info',
                });
                this.$store.commit('updateIsArtistShowcase', {
                    missionId: this.mission.id,
                    isArtistShowcase,
                });
            }
        },
        async toggleIsSeparate(e): Promise<void> {
            const isSeparate = await this.$http.executePost(`/admin/missions/${this.mission.id}/toggleIsSeparate/`, { isSeparate: !this.mission.isSeparate }, e);

            if (!this.$http.isError(isSeparate)) {
                this.$store.dispatch('updateToastMessages', {
                    message: `toggled isSeparate`,
                    type: 'info',
                });
                this.$store.commit('updateIsSeparate', {
                    missionId: this.mission.id,
                    isSeparate,
                });
            }
        },
        async updateRemainingArtists(e): Promise<void> {
            const remainingArtists = await this.$http.executePost(`/admin/missions/${this.mission.id}/updateRemainingArtists`, { remainingArtists: this.remainingArtists }, e);

            if (!this.$http.isError(remainingArtists)) {
                this.$store.dispatch('updateToastMessages', {
                    message: `updated remainingArtists`,
                    type: 'info',
                });
                this.$store.commit('updateRemainingArtists', {
                    missionId: this.mission.id,
                    remainingArtists,
                });
            }
        },
        async toggleOpeningAnnounced(e): Promise<void> {
            const openingAnnounced = await this.$http.executePost(`/admin/missions/${this.mission.id}/toggleOpeningAnnounced/`, { openingAnnounced: !this.mission.openingAnnounced }, e);

            if (!this.$http.isError(openingAnnounced)) {
                this.$store.dispatch('updateToastMessages', {
                    message: `toggled openingAnnounced`,
                    type: 'info',
                });
                this.$store.commit('updateOpeningAnnounced', {
                    missionId: this.mission.id,
                    openingAnnounced,
                });
            }
        },
        async toggleClosingAnnounced(e): Promise<void> {
            const closingAnnounced = await this.$http.executePost(`/admin/missions/${this.mission.id}/toggleClosingAnnounced/`, { closingAnnounced: !this.mission.closingAnnounced }, e);

            if (!this.$http.isError(closingAnnounced)) {
                this.$store.dispatch('updateToastMessages', {
                    message: `toggled closingAnnounced`,
                    type: 'info',
                });
                this.$store.commit('updateClosingAnnounced', {
                    missionId: this.mission.id,
                    closingAnnounced,
                });
            }
        },
        async updateUserMaximumRankedBeatmapsCount(e): Promise<void> {
            const userMaximumRankedBeatmapsCount = await this.$http.executePost(`/admin/missions/${this.mission.id}/updateUserMaximumRankedBeatmapsCount/`, { userMaximumRankedBeatmapsCount: this.userMaximumRankedBeatmapsCount }, e);

            if (!this.$http.isError(userMaximumRankedBeatmapsCount)) {
                this.$store.dispatch('updateToastMessages', {
                    message: `updated user max ranked maps count for mission`,
                    type: 'info',
                });
                this.$store.commit('updateUserMaximumRankedBeatmapsCount', {
                    missionId: this.mission.id,
                    userMaximumRankedBeatmapsCount,
                });
            }
        },
        async updateUserMaximumGlobalRank(e): Promise<void> {
            const userMaximumGlobalRank = await this.$http.executePost(`/admin/missions/${this.mission.id}/updateUserMaximumGlobalRank/`, { userMaximumGlobalRank: this.userMaximumGlobalRank }, e);

            if (!this.$http.isError(userMaximumGlobalRank)) {
                this.$store.dispatch('updateToastMessages', {
                    message: `updated user max global rank for mission`,
                    type: 'info',
                });
                this.$store.commit('updateUserMaximumGlobalRank', {
                    missionId: this.mission.id,
                    userMaximumGlobalRank,
                });
            }
        },
        async updateUserMaximumPp(e): Promise<void> {
            const userMaximumPp = await this.$http.executePost(`/admin/missions/${this.mission.id}/updateUserMaximumPp/`, { userMaximumPp: this.userMaximumPp }, e);

            if (!this.$http.isError(userMaximumPp)) {
                this.$store.dispatch('updateToastMessages', {
                    message: `updated user max pp for mission`,
                    type: 'info',
                });
                this.$store.commit('updateUserMaximumPp', {
                    missionId: this.mission.id,
                    userMaximumPp,
                });
            }
        },
        async updateUserMinimumPp(e): Promise<void> {
            const userMinimumPp = await this.$http.executePost(`/admin/missions/${this.mission.id}/updateUserMinimumPp/`, { userMinimumPp: this.userMinimumPp }, e);

            if (!this.$http.isError(userMinimumPp)) {
                this.$store.dispatch('updateToastMessages', {
                    message: `updated user min pp for mission`,
                    type: 'info',
                });
                this.$store.commit('updateUserMinimumPp', {
                    missionId: this.mission.id,
                    userMinimumPp,
                });
            }
        },
        async updateUserMinimumRank(e): Promise<void> {
            const userMinimumRank = await this.$http.executePost(`/admin/missions/${this.mission.id}/updateUserMinimumRank/`, { userMinimumRank: this.userMinimumRank }, e);

            if (!this.$http.isError(userMinimumRank)) {
                this.$store.dispatch('updateToastMessages', {
                    message: `updated user min mg rank for mission`,
                    type: 'info',
                });
                this.$store.commit('updateUserMinimumRank', {
                    missionId: this.mission.id,
                    userMinimumRank,
                });
            }
        },
        async updateBeatmapEarliestSubmissionDate(e): Promise<void> {
            const beatmapEarliestSubmissionDate = await this.$http.executePost(`/admin/missions/${this.mission.id}/updateBeatmapEarliestSubmissionDate/`, { beatmapEarliestSubmissionDate: this.beatmapEarliestSubmissionDate }, e);

            if (!this.$http.isError(beatmapEarliestSubmissionDate)) {
                this.$store.dispatch('updateToastMessages', {
                    message: `updated beatmap earliest submission date`,
                    type: 'info',
                });
                this.$store.commit('updateBeatmapEarliestSubmissionDate', {
                    missionId: this.mission.id,
                    beatmapEarliestSubmissionDate,
                });
            }
        },
        async updateBeatmapLatestSubmissionDate(e): Promise<void> {
            const beatmapLatestSubmissionDate = await this.$http.executePost(`/admin/missions/${this.mission.id}/updateBeatmapLatestSubmissionDate/`, { beatmapLatestSubmissionDate: this.beatmapLatestSubmissionDate }, e);

            if (!this.$http.isError(beatmapLatestSubmissionDate)) {
                this.$store.dispatch('updateToastMessages', {
                    message: `updated beatmap latest submission date`,
                    type: 'info',
                });
                this.$store.commit('updateBeatmapLatestSubmissionDate', {
                    missionId: this.mission.id,
                    beatmapLatestSubmissionDate,
                });
            }
        },
        async updateBeatmapMinimumFavorites(e): Promise<void> {
            const beatmapMinimumFavorites = await this.$http.executePost(`/admin/missions/${this.mission.id}/updateBeatmapMinimumFavorites/`, { beatmapMinimumFavorites: this.beatmapMinimumFavorites }, e);

            if (!this.$http.isError(beatmapMinimumFavorites)) {
                this.$store.dispatch('updateToastMessages', {
                    message: `updated beatmap minimum favorites`,
                    type: 'info',
                });
                this.$store.commit('updateBeatmapMinimumFavorites', {
                    missionId: this.mission.id,
                    beatmapMinimumFavorites,
                });
            }
        },
        async updateBeatmapMinimumPlayCount(e): Promise<void> {
            const beatmapMinimumPlayCount = await this.$http.executePost(`/admin/missions/${this.mission.id}/updateBeatmapMinimumPlayCount/`, { beatmapMinimumPlayCount: this.beatmapMinimumPlayCount }, e);

            if (!this.$http.isError(beatmapMinimumPlayCount)) {
                this.$store.dispatch('updateToastMessages', {
                    message: `updated beatmap minimum playcount`,
                    type: 'info',
                });
                this.$store.commit('updateBeatmapMinimumPlayCount', {
                    missionId: this.mission.id,
                    beatmapMinimumPlayCount,
                });
            }
        },
        async toggleDifficulty(e): Promise<void> {
            const beatmapDifficulties = await this.$http.executePost(`/admin/missions/${this.mission.id}/toggleDifficulty/`, { difficulty: this.selectedDifficulty }, e);

            if (!this.$http.isError(beatmapDifficulties)) {
                this.$store.dispatch('updateToastMessages', {
                    message: `toggled difficulty`,
                    type: 'info',
                });
                this.$store.commit('updateBeatmapDifficulties', {
                    missionId: this.mission.id,
                    beatmapDifficulties,
                });
            }
        },
        async updateBeatmapMinimumLength(e): Promise<void> {
            const beatmapMinimumLength = await this.$http.executePost(`/admin/missions/${this.mission.id}/updateBeatmapMinimumLength/`, { beatmapMinimumLength: this.beatmapMinimumLength }, e);

            if (!this.$http.isError(beatmapMinimumLength)) {
                this.$store.dispatch('updateToastMessages', {
                    message: `updated beatmap minimum length`,
                    type: 'info',
                });
                this.$store.commit('updateBeatmapMinimumLength', {
                    missionId: this.mission.id,
                    beatmapMinimumLength,
                });
            }
        },
        async updateBeatmapMaximumLength(e): Promise<void> {
            const beatmapMaximumLength = await this.$http.executePost(`/admin/missions/${this.mission.id}/updateBeatmapMaximumLength/`, { beatmapMaximumLength: this.beatmapMaximumLength }, e);

            if (!this.$http.isError(beatmapMaximumLength)) {
                this.$store.dispatch('updateToastMessages', {
                    message: `updated beatmap maximum length`,
                    type: 'info',
                });
                this.$store.commit('updateBeatmapMaximumLength', {
                    missionId: this.mission.id,
                    beatmapMaximumLength,
                });
            }
        },
        async toggleIsUniqueToRanked(e): Promise<void> {
            const isUniqueToRanked = await this.$http.executePost(`/admin/missions/${this.mission.id}/toggleIsUniqueToRanked/`, { isUniqueToRanked: !this.mission.isUniqueToRanked }, e);

            if (!this.$http.isError(isUniqueToRanked)) {
                this.$store.dispatch('updateToastMessages', {
                    message: `toggled isUniqueToRanked`,
                    type: 'info',
                });
                this.$store.commit('updateIsUniqueToRanked', {
                    missionId: this.mission.id,
                    isUniqueToRanked,
                });
            }
        },
        async updateAdditionalRequirement(e): Promise<void> {
            const additionalRequirement = await this.$http.executePost(`/admin/missions/${this.mission.id}/updateAdditionalRequirement/`, { additionalRequirement: this.additionalRequirement }, e);

            if (!this.$http.isError(additionalRequirement)) {
                this.$store.dispatch('updateToastMessages', {
                    message: `updated beatmap additional requirement`,
                    type: 'info',
                });
                this.$store.commit('updateAdditionalRequirement', {
                    missionId: this.mission.id,
                    additionalRequirement,
                });
            }
        },
    },
});
</script>