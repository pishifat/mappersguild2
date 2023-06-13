<template>
    <div>
        <mission-information />
        <div class="radial-divisor" />
        <mission-card
            v-for="mission in openMissions"
            :key="mission.id"
            :mission="mission"
        />
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { mapGetters, mapState } from 'vuex';
import missionsModule from '@store/missions';
import MissionCard from '@components/missions/MissionCard.vue';
import MissionInformation from '@components/missions/MissionInformation.vue';

export default defineComponent({
    name: 'MissionPage',
    components: {
        MissionCard,
        MissionInformation,
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
        const missions: any = await this.$http.initialRequest('/missions/relevantInfo');

        if (!this.$http.isError(missions)) {
            this.$store.commit('missions/setMissions', missions);
            this.$store.commit('missions/setFirstLoadDone');
        }
    },
});
</script>
