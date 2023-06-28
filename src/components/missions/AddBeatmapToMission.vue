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
        missionId: {
            type: String,
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
        validBeatmaps (): Beatmap[] {
            return this.userBeatmaps;
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

            const mission = await this.$http.executePost<Mission>(`/missions/${this.missionId}/${this.selectedBeatmapId}/addBeatmapToMission`, {}, e);

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
