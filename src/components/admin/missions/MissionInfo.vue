<template>
    <modal-dialog id="editMission">
        <template #header>
            {{ mission.name }}
        </template>

        <div class="container">
            <!-- name -->
            <p class="row">
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
            </p>
            <!-- tier -->
            <p class="row">
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
            </p>
            <!-- objective -->
            <p class="row">
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
            </p>
            <!-- win condition -->
            <p class="row">
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
            </p>

            <!-- status -->
            <p class="row">
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
            </p>

            <!-- user reqiurements -->
            <hr />
            <h5>User requirements</h5>

            <!-- max ranked maps -->
            <p class="row">
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
            </p>
            <!-- max global rank -->
            <p class="row">
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
            </p>

            <!-- associated beatmaps -->
            <associated-beatmaps
                v-if="mission.associatedMaps && mission.associatedMaps.length"
                class="mb-4"
                :associated-maps="mission.associatedMaps"
                :mission-id="mission.id"
                :mission-status="mission.status"
            />
        </div>
    </modal-dialog>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import ModalDialog from '@components/ModalDialog.vue';
import AssociatedBeatmaps from '@components/missions/AssociatedBeatmaps.vue';
import { Mission } from '@interfaces/mission';

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
            name: this.mission.name,
            tier: this.mission.tier,
            objective: this.mission.objective,
            winCondition: this.mission.winCondition,
            status: this.mission.status,
            userMaximumRankedBeatmapsCount: this.mission.userMaximumRankedBeatmapsCount,
            userMaximumGlobalRank: this.mission.userMaximumGlobalRank,
        };
    },
    watch: {
        mission(): void {
            this.name = this.mission.name;
            this.tier = this.mission.tier;
            this.objective = this.mission.objective;
            this.winCondition = this.mission.winCondition;
            this.status = this.mission.status;
            this.userMaximumRankedBeatmapsCount = this.mission.userMaximumRankedBeatmapsCount;
            this.userMaximumGlobalRank = this.mission.userMaximumGlobalRank;
        },
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
    },
});
</script>