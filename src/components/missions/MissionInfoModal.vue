<template>
    <modal-dialog id="editMission" :header-class="`bg-rank-${selectedMission ? selectedMission.tier : 1}`" :loaded="Boolean(selectedMission)">
        <template #header>
            <a :href="`/missions?id=${selectedMission.id}`" target="_blank" class="text-dark">
                {{ selectedMission.name }}
                <span v-if="selectedMission.modes && selectedMission.modes.length && selectedMission.modes.length < 4" class="text-primary small">({{ cleanModes.join(', ') + ' only' }})</span>
            </a>
        </template>

        <template #default>
            <div class="container">
                <div class="text-center">
                    <img :src="findTierImage" class="info-mission-tier" />
                    <div class="fs-4">
                        <b>{{ selectedMission.name }}</b>
                    </div>
                    <div><b>Tier {{ selectedMission.tier }}</b> priority quest</div>
                    <hr />
                </div>
                <mission-details
                    :meets-requirements="meetsRequirements"
                    :mission="selectedMission"
                />

                <hr />

                <div>
                    <add-beatmap-to-mission
                        v-if="meetsRequirements && selectedMission.status == 'open'"
                        :mission-id="selectedMission.id"
                    />
                    <associated-beatmaps
                        :mission="selectedMission"
                    />
                </div>
            </div>
        </template>
    </modal-dialog>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { mapState, mapGetters } from 'vuex';
import ModalDialog from '@components/ModalDialog.vue';
import AssociatedBeatmaps from '@components/missions/AssociatedBeatmaps.vue';
import AddBeatmapToMission from '@components/missions/AddBeatmapToMission.vue';
import MissionDetails from '@components/missions/MissionDetails.vue';
import { MissionMode } from '@interfaces/mission';

export default defineComponent({
    name: 'MissionCard',
    components: {
        AssociatedBeatmaps,
        AddBeatmapToMission,
        MissionDetails,
        ModalDialog,
    },
    computed: {
        ...mapState([
            'loggedInUser',
        ]),
        ...mapGetters('missions', [
            'selectedMission',
        ]),
        findTierImage(): string {
            switch (this.selectedMission.tier) {
                case 1:
                    return '/images/bronze.png';
                case 2:
                    return '/images/silver.png';
                case 3:
                    return '/images/gold.png';
                case 4:
                    return '/images/platinum.png';
                default:
                    return '/images/bronze.png';
            }
        },
        meetsRequirements(): boolean {
            if ((this.selectedMission.userMaximumRankedBeatmapsCount || this.selectedMission.userMaximumRankedBeatmapsCount == 0) && (this.loggedInUser.rankedBeatmapsCount > this.selectedMission.userMaximumRankedBeatmapsCount)) {
                return false;
            }

            if (this.selectedMission.userMaximumGlobalRank && this.loggedInUser.globalRank < this.selectedMission.userMaximumGlobalRank) {
                return false;
            }

            if (this.selectedMission.userMaximumPp && (this.loggedInUser.pp > this.selectedMission.userMaximumPp)) {
                return false;
            }

            return true;
        },
        cleanModes(): string[] {
            const cleanModes: string[] = [];

            for (const mode of this.selectedMission.modes) {
                switch (mode) {
                    case MissionMode.Osu:
                        cleanModes.push('osu!');
                        break;
                    case MissionMode.Taiko:
                        cleanModes.push('osu!taiko');
                        break;
                    case MissionMode.Catch:
                        cleanModes.push('osu!catch');
                        break;
                    case MissionMode.Mania:
                        cleanModes.push('osu!mania');
                        break;
                    default:
                        break;
                }
            }

            return cleanModes;
        },
    },
});
</script>

<style scoped>
.info-mission-tier {
    max-width: 100px;
    max-height: 100px;
    object-fit: cover;
}

.card-body {
    padding: 0.5rem 1rem 0.5rem 3.5rem;
}
</style>
