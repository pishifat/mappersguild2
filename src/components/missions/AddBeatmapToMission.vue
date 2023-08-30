<template>
    <div class="mb-2">
        <div class="input-group input-group-sm">
            <select
                v-model="selectedBeatmapId"
                class="form-select"
            >
                <option
                    value=""
                    disabled
                    selected
                >
                    Select a beatmap
                </option>
                <option value="-" disabled>
                    ---
                </option>
                <option
                    v-for="beatmap in validBeatmaps"
                    :key="beatmap.id"
                    :value="beatmap.id"
                >
                    {{ beatmap.song.artist }} - {{ beatmap.song.title }}
                </option>
                <option
                    v-if="!validBeatmaps.length"
                    value="."
                    disabled
                >
                    No valid beatmaps for this quest
                </option>
            </select>
            <button
                class="btn btn-outline-info"
                @click="addBeatmapToMission($event)"
            >
                Add beatmap
            </button>
        </div>
    </div>
</template>


<script lang="ts">
import { defineComponent } from 'vue';
import { mapState } from 'vuex';
import { Mission } from '@interfaces/mission';
import { Beatmap } from '@interfaces/beatmap/beatmap';

export default defineComponent({
    name: 'AddBeatmapToMission',
    props: {
        mission: {
            type: Object as () => Mission,
            required: true,
        },
    },
    data () {
        return {
            selectedBeatmapId: '',
        };
    },
    computed: {
        ...mapState('missions', [
            'userBeatmaps',
        ]),
        ...mapState([
            'loggedInUser',
        ]),
        validBeatmaps (): Beatmap[] {
            const filteredBeatmaps = [...this.userBeatmaps].filter(b => {
                if (this.mission.beatmapEarliestSubmissionDate && (new Date(b.submissionDate) < new Date(this.mission.beatmapEarliestSubmissionDate))) {
                    return false;
                }

                if (this.mission.beatmapLatestSubmissionDate && (new Date(b.submissionDate) > new Date(this.mission.beatmapLatestSubmissionDate))) {
                    return false;
                }

                if ((this.mission.userMaximumRankedBeatmapsCount || this.mission.userMaximumRankedBeatmapsCount == 0) && (this.loggedInUser.rankedBeatmapsCount > this.mission.userMaximumRankedBeatmapsCount)) {
                    return false;
                }

                if (this.mission.userMaximumGlobalRank && (this.loggedInUser.globalRank < this.mission.userMaximumGlobalRank)) {
                    return false;
                }

                let modePp = 0;

                switch (b.mode) {
                    case 'osu':
                        modePp = this.loggedInUser.ppOsu;
                        break;
                    case 'taiko':
                        modePp = this.loggedInUser.ppTaiko;
                        break;
                    case 'catch':
                        modePp = this.loggedInUser.ppCatch;
                        break;
                    case 'mania':
                        modePp = this.loggedInUser.ppMania;
                        break;
                }

                if (this.mission.userMaximumPp && (modePp > this.mission.userMaximumPp)) {
                    return false;
                }

                return true;
            });

            return filteredBeatmaps;
        },
    },
    methods: {
        async addBeatmapToMission(e): Promise<void> {
            if (!this.selectedBeatmapId) {
                this.$store.dispatch('updateToastMessages', {
                    message: `Select a beatmap`,
                    type: 'danger',
                });

                return;
            }

            const mission = await this.$http.executePost<Mission>(`/missions/${this.mission.id}/${this.selectedBeatmapId}/addBeatmapToMission`, {}, e);

            if (!this.$http.isError(mission)) {
                this.$store.dispatch('updateToastMessages', {
                    message: `Added beatmap to mission`,
                    type: 'info',
                });
                this.$store.commit('missions/updateMission', mission);
            }
        },
    },
});
</script>
