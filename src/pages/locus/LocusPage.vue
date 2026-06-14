<template>
    <div>
        <div class="container card card-body py-4 my-4">
            <h3 class="text-center">
                <a href="https://osu.ppy.sh/home/news/2025-01-31-locus" target="_blank">Locus</a>'s Nexus is closed for the year! Check back again in 2027 :)
            </h3>
        </div>
        <!--
        <team-page-filters :store-module="storeModule" :role-options="filterRoleOptions" />
        <div class="container card card-body mb-2">
            <h5 class="mt-2">
                <a
                    data-bs-toggle="collapse"
                    :href="`#selfDetails`"
                >
                    Your details
                    <i class="fas fa-angle-down" />
                </a>
            </h5>
            <self-team-info
                id="selfDetails"
                class="collapse"
                :api-base="apiBase"
                :store-module="storeModule"
                :role-options="selfRoleOptions"
            />
        </div>
        <div class="radial-divisor" />
        <div class="container card card-body">
            <h4>Potential team members</h4>
            <div class="row">
                <team-card
                    v-for="teamInfo in filteredTeamInfos"
                    :key="teamInfo.id"
                    :team-info="teamInfo"
                    :api-base="apiBase"
                    :store-module="storeModule"
                    class="col-lg-6"
                />
            </div>
        </div>
        -->
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { mapState, mapGetters } from 'vuex';
import locusModule from '@store/locus';
import { TeamInfo } from '@interfaces/teamInfo';
import TeamPageFilters from './TeamPageFilters.vue';
import SelfTeamInfo from '@components/teamContest/SelfTeamInfo.vue';
import TeamCard from '@components/teamContest/TeamCard.vue';

export default defineComponent({
    name: 'LocusPage',
    components: {
        TeamPageFilters,
        SelfTeamInfo,
        TeamCard,
    },
    data () {
        return {
            apiBase: '/locus',
            storeModule: 'locus',
            selfRoleOptions: ['visual designer', 'mapper', 'musician'],
            filterRoleOptions: { any: 'Any', 'visual designer': 'Visual designer', mapper: 'Mapper', musician: 'Musician' },
        };
    },
    computed: {
        ...mapState([
            'loggedInUser',
        ]),
        ...mapState('locus', [
            'selfTeamInfo',
        ]),
        ...mapGetters('locus', [
            'filteredTeamInfos',
        ]),
    },
    beforeCreate () {
        if (!this.$store.hasModule('locus')) {
            this.$store.registerModule('locus', locusModule);
        }
    },
    async created () {
        /*const res = await this.$http.initialRequest<{ teamInfos: TeamInfo[], selfTeamInfo: TeamInfo }>('/locus/query');

        if (!this.$http.isError(res)) {
            this.$store.commit('locus/setTeamInfos', res.teamInfos);
            this.$store.commit('locus/setSelfTeamInfo', res.selfTeamInfo);
        }*/
    },
    methods: {
    },
});
</script>
