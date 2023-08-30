<template>
    <modal-dialog id="editMission">
        <template #header>
            {{ mission.name }}
        </template>

        <div class="container">
            <!-- name -->
            <div class="row mt-2">
                <input
                    v-model="name"
                    class="form-control form-control-sm mx-2 w-50"
                    type="text"
                    autocomplete="off"
                    placeholder="mission name..."
                />
                <button class="btn btn-sm btn-outline-info w-25" @click="updateName($event)">
                    Rename mission
                </button>
            </div>
            <!-- tier -->
            <div class="row mt-2">
                <input
                    v-model="tier"
                    class="form-control form-control-sm mx-2 w-50"
                    type="text"
                    autocomplete="off"
                    placeholder="tier..."
                />
                <button class="btn btn-sm btn-outline-info w-25" @click="updateTier($event)">
                    Update tier
                </button>
            </div>
            <!-- objective -->
            <div class="row mt-2">
                <textarea
                    v-model="objective"
                    class="form-control form-control-sm mx-2 mt-2 w-50"
                    type="text"
                    autocomplete="off"
                    placeholder="mission objective..."
                />
                <button class="btn btn-sm btn-outline-info w-25 mt-2" @click="updateObjective($event)">
                    Update objective
                </button>
            </div>
            <!-- win condition -->
            <div class="row mt-2">
                <textarea
                    v-model="winCondition"
                    class="form-control form-control-sm mx-2 mt-2 w-50"
                    type="text"
                    autocomplete="off"
                    placeholder="mission win condition..."
                />
                <button class="btn btn-sm btn-outline-info w-25 mt-2" @click="updateWinCondition($event)">
                    Update win condition
                </button>
            </div>

            <!-- status -->
            <div class="row">
                <select
                    v-model="status"
                    class="form-select form-select-sm mx-2 mt-2 w-50"
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
                <button class="btn btn-sm btn-outline-info mt-2 w-25" @click="updateStatus($event)">
                    Update status
                </button>
            </div>

            <!-- modes -->
            <div class="row">
                <select
                    v-model="mode"
                    class="form-select form-select-sm mx-2 mt-2 w-25"
                >
                    <option value="" disabled>
                        Select a mode
                    </option>
                    <option v-for="aMode in availableModes" :key="aMode">
                        {{ aMode }}
                    </option>
                </select>
                <div class="w-25 mt-2">
                    {{ mission.modes }}
                </div>
                <button class="btn btn-sm btn-outline-info mt-2 w-25" @click="toggleMode($event)">
                    Toggle mode
                </button>
            </div>

            <!-- artists -->
            <div v-if="availableArtists" class="row">
                <select
                    v-model="selectedArtist"
                    class="form-select form-select-sm mx-2 mt-2 w-25"
                >
                    <option :value="{}" disabled>
                        Select an artist
                    </option>
                    <option v-for="artist in availableArtists" :key="artist.id">
                        {{ artist.label }}
                    </option>
                </select>
                <div v-if="mission.artists && mission.artists.length" class="w-25 mt-2">
                    {{ mission.artists.map(a => a.label) }}
                </div>
                <button class="btn btn-sm btn-outline-info mt-2 w-25" @click="toggleArtist($event)">
                    Toggle artist
                </button>
            </div>

            <!-- openingAnnounced -->
            <div class="row">
                <div class="col-sm-6 mt-2">
                    Opening announced: <span :class="mission.openingAnnounced ? 'text-success' : 'text-danger'">{{ mission.openingAnnounced }}</span>
                </div>
                <button class="btn btn-sm btn-outline-info mt-2 ms-3 w-25" @click="toggleOpeningAnnounced($event)">
                    Toggle openingAnnounced
                </button>
            </div>
            <!-- closingAnnounced -->
            <div class="row">
                <div class="col-sm-6 mt-2">
                    Closing announced: <span :class="mission.closingAnnounced ? 'text-success' : 'text-danger'">{{ mission.closingAnnounced }}</span>
                </div>
                <button class="btn btn-sm btn-outline-info mt-2 ms-3 w-25" @click="toggleClosingAnnounced($event)">
                    Toggle closingAnnounced
                </button>
            </div>

            <!-- user reqiurements -->
            <hr />
            <h5>User requirements</h5>

            <!-- max ranked maps -->
            <div class="row">
                <input
                    v-model="userMaximumRankedBeatmapsCount"
                    class="form-control form-control-sm mx-2 w-50"
                    type="text"
                    autocomplete="off"
                    placeholder="maximum ranked maps allowed..."
                />
                <button class="btn btn-sm btn-outline-info w-25" @click="updateUserMaximumRankedBeatmapsCount($event)">
                    Update user max ranked maps count
                </button>
            </div>
            <!-- max global rank -->
            <div class="row mt-2">
                <input
                    v-model="userMaximumGlobalRank"
                    class="form-control form-control-sm mx-2 w-50"
                    type="number"
                    autocomplete="off"
                    placeholder="maximum global rank allowed..."
                />
                <button class="btn btn-sm btn-outline-info w-25" @click="updateUserMaximumGlobalRank($event)">
                    Update user max global rank
                </button>
            </div>
            <!-- max pp -->
            <div class="row mt-2">
                <input
                    v-model="userMaximumPp"
                    class="form-control form-control-sm mx-2 w-50"
                    type="number"
                    autocomplete="off"
                    placeholder="maximum pp allowed..."
                />
                <button class="btn btn-sm btn-outline-info w-25" @click="updateUserMaximumPp($event)">
                    Update user max pp
                </button>
            </div>
            <!-- earliest submission date -->
            <div class="row mt-2">
                <input
                    v-model="beatmapEarliestSubmissionDate"
                    class="form-control form-control-sm mx-2 w-50"
                    type="date"
                    autocomplete="off"
                    placeholder="earliest submission date allowed..."
                />
                <button class="btn btn-sm btn-outline-info w-25" @click="updateBeatmapEarliestSubmissionDate($event)">
                    Update beatmap earliest submission date
                </button>
                <span class="small">current: <b>{{ mission.beatmapEarliestSubmissionDate }}</b></span>
            </div>
            <!-- latest submission date -->
            <div class="row mt-2">
                <input
                    v-model="beatmapLatestSubmissionDate"
                    class="form-control form-control-sm mx-2 w-50"
                    type="date"
                    autocomplete="off"
                    placeholder="latest submission date allowed..."
                />
                <button class="btn btn-sm btn-outline-info w-25" @click="updateBeatmapLatestSubmissionDate($event)">
                    Update beatmap latest submission date
                </button>
                <span class="small">current: <b>{{ mission.beatmapLatestSubmissionDate }}</b></span>
            </div>

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
            name: this.mission.name,
            tier: this.mission.tier,
            objective: this.mission.objective,
            winCondition: this.mission.winCondition,
            status: this.mission.status,
            mode: '',
            selectedArtist: {} as FeaturedArtist,
            artists: this.mission.artists,
            userMaximumRankedBeatmapsCount: this.mission.userMaximumRankedBeatmapsCount,
            userMaximumGlobalRank: this.mission.userMaximumGlobalRank,
            userMaximumPp: this.mission.userMaximumPp,
            beatmapEarliestSubmissionDate: new Date(this.mission.beatmapEarliestSubmissionDate),
            beatmapLatestSubmissionDate: new Date(this.mission.beatmapLatestSubmissionDate),
        };
    },
    watch: {
        mission(): void {
            this.name = this.mission.name;
            this.tier = this.mission.tier;
            this.artists = this.mission.artists;
            this.objective = this.mission.objective;
            this.winCondition = this.mission.winCondition;
            this.status = this.mission.status;
            this.mode = '';
            this.userMaximumRankedBeatmapsCount = this.mission.userMaximumRankedBeatmapsCount;
            this.userMaximumGlobalRank = this.mission.userMaximumGlobalRank;
            this.userMaximumPp = this.mission.userMaximumPp;
            this.beatmapEarliestSubmissionDate = new Date(this.mission.beatmapEarliestSubmissionDate);
            this.beatmapLatestSubmissionDate = new Date(this.mission.beatmapLatestSubmissionDate);
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
    },
});
</script>