<template>
    <div>
        <div class="container card card-body py-1">
            <div class="row">
                <div class="col">
                    <button class="btn btn-sm btn-info w-100 mb-1" data-bs-toggle="modal" data-bs-target="#submitMission">
                        Add mission
                    </button>

                    <data-table
                        v-slot="{ obj: mission }"
                        :data="missions"
                        :headers="['name', 'tier', 'status']"
                        :custom-data-target="'#editMission'"
                        @update:selected-id="selectedMissionId = $event"
                    >
                        <td>
                            {{ mission.name }}
                        </td>
                        <td>
                            {{ mission.tier }}
                        </td>
                        <td>
                            {{ mission.status }}
                        </td>
                    </data-table>
                </div>
            </div>
        </div>

        <submit-mission-modal />

        <mission-info
            v-if="selectedMission"
            :mission="selectedMission"
            @update-mission="updateMission($event)"
        />
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { mapState } from 'vuex';
import SubmitMissionModal from '../../components/missions/SubmitMissionModal.vue';
import DataTable from '../../components/admin/DataTable.vue';
import { Mission } from '../../../interfaces/mission';
import missionsAdminModule from '@store/admin/missions';
import MissionInfo from '../../components/admin/missions/MissionInfo.vue';

export default defineComponent({
    components: {
        DataTable,
        SubmitMissionModal,
        MissionInfo,
    },
    data () {
        return {
            selectedMissionId: '',
        };
    },
    computed: {
        ...mapState({
            missions: (state: any) => state.missionsAdmin.missions,
        }),
        selectedMission(): undefined | Mission {
            return this.missions.find(m => m.id === this.selectedMissionId);
        },
    },
    beforeCreate () {
        if (!this.$store.hasModule('missionsAdmin')) {
            this.$store.registerModule('missionsAdmin', missionsAdminModule);
        }
    },
    unmounted () {
        if (this.$store.hasModule('missionsAdmin')) {
            this.$store.unregisterModule('missionsAdmin');
        }
    },
    async created() {
        const missions = await this.$http.initialRequest<Mission[]>('/admin/missions/load');

        if (!this.$http.isError(missions)) {
            this.$store.commit('setMissions', missions);
        }
    },
    methods: {
        updateMission(m): void {
            const i = this.missions.findIndex(mission => mission.id == m.id);

            if (i !== -1) {
                this.missions[i] = m;
            }
        },
    },
});
</script>
