<template>
    <modal-dialog id="editMission">
        <template #header>
            {{ mission.name }}
        </template>

        <div class="container">
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
            <p class="row">
                <textarea
                    v-model="objective"
                    class="form-control form-control-sm mx-2 mt-2 w-50"
                    type="text"
                    autocomplete="off"
                    placeholder="mission objective..."
                />
                <button class="btn btn-sm btn-outline-info w-25" @click="updateObjective($event)">
                    Update objective
                </button>
            </p>

            <associated-beatmaps
                v-if="mission.associatedMaps && mission.associatedMaps.length"
                class="mb-4"
                :associated-maps="mission.associatedMaps"
            />
        </div>
    </modal-dialog>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import ModalDialog from '@components/ModalDialog.vue';
import AssociatedBeatmaps from '@components/quests/partyInfo/AssociatedBeatmaps.vue';
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
        };
    },
    watch: {
        mission(): void {
            this.name = this.mission.name;
            this.tier = this.mission.tier;
            this.objective = this.mission.objective;
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
    },
});
</script>