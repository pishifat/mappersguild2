<template>
    <modal-dialog id="submitMission" title="Submit mission" modal-size="xl">
        <div class="container">
            <!-- general -->
            <h5>General</h5>
            <!-- artist -->
            <div class="row">
                <form-select
                    v-model="selectedArtistId"
                    class="col-sm-11"
                    label="Artist"
                    placeholder="Any artist (selected by default)"
                >
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
                </form-select>
                <div class="col-sm-1">
                    <button id="artistButton" class="btn btn-sm btn-outline-info" @click="addArtist()">
                        Add
                    </button>
                </div>
            </div>
            <div>
                <ul class="small text-secondary">
                    <li v-if="!selectedArtists.length">
                        Any artist (selected by default)
                    </li>
                    <li v-for="artist in selectedArtists" :key="artist.osuId">
                        {{ artist.label }}
                        <a
                            href="#"
                            class="text-danger"
                            @click.prevent="removeArtist(artist.id)"
                        >
                            <i class="fas fa-minus" />
                        </a>
                    </li>
                </ul>
            </div>

            <!-- mode -->
            <div class="row">
                <form-select
                    v-model="selectedMode"
                    class="col-sm-11"
                    label="Mode"
                    placeholder="Any mode (selected by default)"
                >
                    <option value="-" disabled>
                        ---
                    </option>
                    <option
                        v-for="mode in modes"
                        :key="mode"
                        :value="mode"
                    >
                        {{ mode }}
                    </option>
                </form-select>
                <div class="col-sm-1">
                    <button id="artistButton" class="btn btn-sm btn-outline-info" @click="addMode()">
                        Add
                    </button>
                </div>
            </div>
            <div class="mt-2">
                <ul class="small text-secondary">
                    <li v-if="!selectedModes.length">
                        Any mode (selected by default)
                    </li>
                    <li v-for="mode in selectedModes" :key="mode">
                        {{ mode }}
                        <a
                            href="#"
                            class="text-danger"
                            @click.prevent="removeMode(mode)"
                        >
                            <i class="fas fa-minus" />
                        </a>
                    </li>
                </ul>
            </div>

            <!-- tier -->
            <form-input
                v-model.number="tier"
                label="Tier"
                type="number"
            />

            <!-- name -->
            <form-input
                v-model="name"
                label="Name"
                type="text"
            />

            <!-- objective -->
            <form-textarea v-model="objective" label="Objective" />

            <!-- win condition -->
            <form-textarea v-model="winCondition" label="Win condition" />

            <!-- deadline -->
            <form-input
                v-model="deadline"
                label="Deadline"
                type="date"
            />

            <!-- user requirements -->
            <hr />
            <h5>Classified</h5>

            <!-- isShowcaseMission -->
            <form-input
                v-model.number="isShowcaseMission"
                label="isShowcaseMission"
                description="indicates if a quest includes unreleased featured artists (0 = false, 1 = true)"
                type="number"
            />

            <!-- isArtistShowcase -->
            <form-input
                v-model.number="isArtistShowcase"
                label="isArtistShowcase"
                description="indicates if a showcase quest is artist-based instead of song-based (0 = false, 1 = true)"
                type="number"
            />

            <!-- user requirements -->
            <hr />
            <h5>User requirements</h5>
            <!-- maximum ranked beatmaps count -->
            <form-input
                v-model.number="userMaximumRankedBeatmapsCount"
                label="Max ranked maps"
                type="number"
            />

            <!-- maximum global rank -->
            <form-input
                v-model.number="userMaximumGlobalRank"
                label="Max global rank"
                type="number"
            />

            <!-- maximum pp -->
            <form-input
                v-model.number="userMaximumPp"
                label="Max pp"
                type="number"
            />

            <!-- minimum pp -->
            <form-input
                v-model.number="userMinimumPp"
                label="Min pp"
                type="number"
            />

            <!-- minimum mg rank -->
            <form-input
                v-model.number="userMinimumRank"
                label="Minimum mg rank"
                type="number"
            />

            <!-- beatmap requirements -->
            <hr />
            <h5>Beatmap requirements</h5>

            <!-- earliest submission date -->
            <form-input
                v-model.number="beatmapEarliestSubmissionDate"
                label="Earliest submission date"
                description="has label and validation if >2007"
                type="date"
            />

            <!-- latest submission date -->
            <form-input
                v-model.number="beatmapLatestSubmissionDate"
                label="Latest submission date"
                description="has label and validation if <2050"
                type="date"
            />

            <!-- minimum favorites -->
            <form-input
                v-model.number="beatmapMinimumFavorites"
                label="Minimum favorites"
                description="has label and validation if set. paired with minimum playcount (min fav or min playcount)"
                type="number"
            />

            <!-- minimum playcount -->
            <form-input
                v-model.number="beatmapMinimumPlayCount"
                label="Minimum playcount"
                description="has label and validation if set. paired with minimum favorites (min fav or min playcount)"
                type="number"
            />

            <!-- difficulties -->
            <div class="row">
                <form-select
                    v-model="selectedDifficulty"
                    class="col-sm-11"
                    label="Difficulties"
                    placeholder="Select a difficulty..."
                >
                    <option value="-" disabled>
                        ---
                    </option>
                    <option
                        v-for="difficulty in ['Easy', 'Normal', 'Hard', 'Insane', 'Expert']"
                        :key="difficulty"
                        :value="difficulty"
                    >
                        {{ difficulty }}
                    </option>
                </form-select>
                <div class="col-sm-1">
                    <button id="difficultyButton" class="btn btn-sm btn-outline-info" @click="addDifficulty()">
                        Add
                    </button>
                </div>
            </div>
            <div>
                <ul class="small text-secondary">
                    <li v-for="difficulty in selectedDifficulties" :key="difficulty">
                        {{ difficulty }}
                        <a
                            href="#"
                            class="text-danger"
                            @click.prevent="removeDifficulty(difficulty)"
                        >
                            <i class="fas fa-minus" />
                        </a>
                    </li>
                </ul>
            </div>

            <!-- minimum length -->
            <form-input
                v-model.number="beatmapMinimumLength"
                label="Minimum length"
                description="in seconds. only label (no validation)"
                type="number"
            />

            <!-- maximum length -->
            <form-input
                v-model.number="beatmapMaximumLength"
                label="Maximum length"
                description="in seconds. only label (no validation)"
                type="number"
            />

            <!-- isUniqueToRanked -->
            <form-input
                v-model.number="isUniqueToRanked"
                label="isUniqueToRanked"
                description="0 = false, 1 = true. only label (no validation)"
                type="number"
            />

            <!-- isOsuOriginal -->
            <form-input
                v-model.number="isOsuOriginal"
                label="isOsuOriginal"
                description="0 = false, 1 = true. only label (no validation)"
                type="number"
            />

            <!-- additional requirement -->
            <form-input
                v-model="additionalRequirement"
                label="Additional requirement"
                description="only label (no validation)"
                type="text"
            />

            <!-- add mission -->
            <button
                class="btn btn-outline-success w-100"
                @click="addMission($event)"
            >
                Add mission
            </button>
        </div>
    </modal-dialog>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { mapState } from 'vuex';
import ModalDialog from '@components/ModalDialog.vue';
import { FeaturedArtist } from '@interfaces/featuredArtist';
import { MissionMode } from '@interfaces/mission';
import FormInput from '@components/admin/FormInput.vue';
import FormSelect from '@components/admin/FormSelect.vue';
import FormTextarea from '@components/admin/FormTextarea.vue';

export default defineComponent({
    name: 'SubmitMissionModal',
    components: {
        ModalDialog,
        FormInput,
        FormSelect,
        FormTextarea,
    },
    props: {
        isAdmin: Boolean,
    },
    data() {
        return {
            modes: MissionMode,
            featuredArtists: [] as FeaturedArtist[],
            selectedArtists: [] as Partial<FeaturedArtist>[],
            selectedArtistId: '',
            selectedDifficulties: [] as string[],
            selectedDifficulty: '',
            selectedMode: '',
            selectedModes: [] as string[],
            tier: '',
            deadline: '',
            objective: '',
            name: '',
            winCondition: '',
            isShowcaseMission: 0,
            isArtistShowcase: 0,
            userMaximumRankedBeatmapsCount: null,
            userMaximumGlobalRank: null,
            userMaximumPp: null,
            userMinimumPp: null,
            userMinimumRank: null,
            beatmapEarliestSubmissionDate: '2007-01-01',
            beatmapLatestSubmissionDate: '2100-01-01',
            beatmapMinimumFavorites: null,
            beatmapMinimumPlayCount: null,
            beatmapMinimumLength: null,
            beatmapMaximumLength: null,
            isUniqueToRanked: 0,
            isOsuOriginal: 0,
            additionalRequirement: '',
        };
    },
    computed: {
        ...mapState([
            'loggedInUser',
        ]),
    },
    async created () {
        const res: any = await this.$http.executeGet<FeaturedArtist[]>('/featuredArtists');

        if (res) {
            this.featuredArtists = res.sort((a, b) => {
                if (a.label.toLowerCase() > b.label.toLowerCase()) return 1;
                if (b.label.toLowerCase() > a.label.toLowerCase()) return -1;

                return 0;
            });
        }
    },
    methods: {
        addArtist(): void {
            if (this.selectedArtistId.length) {
                const i = this.featuredArtists.findIndex(a => a.id == this.selectedArtistId);
                const fa = this.featuredArtists[i];
                const min = {
                    id: fa.id,
                    _id: fa._id,
                    label: fa.label,
                    osuId: fa.osuId,
                };

                this.selectedArtists.push(min);
            }
        },
        addMode(): void {
            if (this.selectedMode.length) {
                this.selectedModes.push(this.selectedMode);
            }
        },
        addDifficulty(): void {
            if (this.selectedDifficulty.length) {
                this.selectedDifficulties.push(this.selectedDifficulty);
            }
        },
        removeArtist(id): void {
            const i = this.selectedArtists.findIndex(a => a.id == id);
            this.selectedArtists.splice(i, 1);
        },
        removeMode(mode): void {
            const i = this.selectedModes.findIndex(m => m == mode);
            this.selectedModes.splice(i, 1);
        },
        removeDifficulty(difficulty): void {
            const i = this.selectedDifficulties.findIndex(d => d == difficulty);
            this.selectedDifficulties.splice(i, 1);
        },
        async addMission(e): Promise<void> {
            if (typeof this.name == 'number') {
                this.$store.dispatch('updateToastMessages', {
                    message: `Choose a name that doesn't start with a number`, // i don't know why this happens and it's not worth troubleshooting
                    type: 'danger',
                });

                return;
            }

            const mission = await this.$http.executePost('/admin/missions/create', {
                artists: this.selectedArtists,
                tier: this.tier,
                name: this.name,
                deadline: this.deadline,
                objective: this.objective,
                modes: this.selectedModes,
                winCondition: this.winCondition,
                isShowcaseMission: new Boolean(this.isShowcaseMission),
                isArtistShowcase: new Boolean(this.isArtistShowcase),
                userMaximumRankedBeatmapsCount: this.userMaximumRankedBeatmapsCount,
                userMaximumGlobalRank: this.userMaximumGlobalRank,
                userMaximumPp: this.userMaximumPp,
                userMinimumPp: this.userMinimumPp,
                userMinimumRank: this.userMinimumRank,
                beatmapEarliestSubmissionDate: this.beatmapEarliestSubmissionDate,
                beatmapLatestSubmissionDate: this.beatmapLatestSubmissionDate,
                beatmapMinimumFavorites: this.beatmapMinimumFavorites,
                beatmapMinimumPlayCount: this.beatmapMinimumPlayCount,
                beatmapDifficulties: this.selectedDifficulties,
                beatmapMinimumLength: this.beatmapMinimumLength,
                beatmapMaximumLength: this.beatmapMaximumLength,
                isUniqueToRanked: new Boolean(this.isUniqueToRanked),
                isOsuOriginal: new Boolean(this.isOsuOriginal),
                additionalRequirement: this.additionalRequirement,
            }, e);

            if (!this.$http.isError(mission)) {
                this.$store.commit('addMission', mission);
                this.$bs.hideModal('submitMission');
            }
        },
    },
});
</script>
