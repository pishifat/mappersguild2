<template>
    <modal-dialog id="submitMission" title="Submit mission">
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
                v-model.number="name"
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
            selectedMode: '',
            selectedModes: [] as string[],
            tier: '',
            deadline: '',
            objective: '',
            name: '',
            winCondition: '',
            userMaximumRankedBeatmapsCount: null,
            userMaximumGlobalRank: null,
            userMaximumPp: null,
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
        removeArtist(id): void {
            const i = this.selectedArtists.findIndex(a => a.id == id);
            this.selectedArtists.splice(i, 1);
        },
        removeMode(mode): void {
            const i = this.selectedModes.findIndex(m => m == mode);
            this.selectedModes.splice(i, 1);
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
                userMaximumRankedBeatmapsCount: this.userMaximumRankedBeatmapsCount,
                userMaximumGlobalRank: this.userMaximumGlobalRank,
                userMaximumPp: this.userMaximumPp,
            }, e);

            if (!this.$http.isError(mission)) {
                this.$store.commit('addMission', mission);
                this.$bs.hideModal('submitMission');
            }
        },
    },
});
</script>
