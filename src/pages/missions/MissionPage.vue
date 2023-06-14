<template>
    <div>
        <mission-page-filters />
        <mission-information />
        <div class="radial-divisor" />
        <div class="container card card-body my-2">
            <h4>Active missions</h4>
            <mission-card
                v-for="mission in openMissions"
                :key="mission.id"
                :mission="mission"
            />
        </div>
        <div class="container card card-body my-4">
            <h4>
                <a href="#closedMissions" data-bs-toggle="collapse" @click.prevent>
                    Inactive missions
                    <i class="fas fa-angle-down" />
                </a>
            </h4>
            <div id="closedMissions" class="collapse">
                <mission-card
                    v-for="mission in closedMissions"
                    :key="mission.id"
                    :mission="mission"
                />
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { mapGetters, mapState } from 'vuex';
import missionsModule from '@store/missions';
import MissionCard from '@components/missions/MissionCard.vue';
import MissionInformation from '@components/missions/MissionInformation.vue';
import MissionPageFilters from './MissionPageFilters.vue';
import { Mission } from '../../../interfaces/mission';
import { Beatmap } from '../../../interfaces/beatmap/beatmap';

export default defineComponent({
    name: 'MissionPage',
    components: {
        MissionCard,
        MissionInformation,
        MissionPageFilters,
    },
    computed: {
        ...mapState('missions', [
            'isFirstLoadDone',
            'isLoadingMissions',
        ]),
        ...mapGetters('missions', [
            'openMissions',
            'closedMissions',
        ]),
    },
    beforeCreate () {
        if (!this.$store.hasModule('missions')) {
            this.$store.registerModule('missions', missionsModule);
        }
    },
    async created () {
        const res = await this.$http.initialRequest<{ missions: Mission[], beatmaps: Beatmap[] }>('/missions/relevantInfo');

        if (!this.$http.isError(res)) {
            this.$store.commit('missions/setMissions', res.missions);
            this.$store.commit('missions/setUserBeatmaps', res.beatmaps);
            this.$store.commit('missions/setFirstLoadDone');
        }
    },
});
</script>
