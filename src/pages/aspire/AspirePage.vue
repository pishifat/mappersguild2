<template>
    <div>
        <div class="container card card-body py-4 my-4">
            <h4>Welcome to Aspire!</h4>
            (some kind of intro text goes here explaining what aspire is)
            <hr />
            <h5>What is this page?</h5>
            (something about how this page is used to find a team member for the contest)
        </div>
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
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { mapState, mapGetters } from 'vuex';
import aspireModule from '@store/aspire';
import { TeamInfo } from '@interfaces/teamInfo';
import TeamPageFilters from '@pages/locus/TeamPageFilters.vue';
import SelfTeamInfo from '@components/locus/SelfTeamInfo.vue';
import TeamCard from '@components/locus/TeamCard.vue';

export default defineComponent({
    name: 'AspirePage',
    components: {
        TeamPageFilters,
        SelfTeamInfo,
        TeamCard,
    },
    data () {
        return {
            apiBase: '/aspire',
            storeModule: 'aspire',
            selfRoleOptions: ['mapper', 'storyboarder'],
            filterRoleOptions: { any: 'Any', mapper: 'Mapper', storyboarder: 'Storyboarder' },
        };
    },
    computed: {
        ...mapState([
            'loggedInUser',
        ]),
        ...mapState('aspire', [
            'selfTeamInfo',
        ]),
        ...mapGetters('aspire', [
            'filteredTeamInfos',
        ]),
    },
    beforeCreate () {
        if (!this.$store.hasModule('aspire')) {
            this.$store.registerModule('aspire', aspireModule);
        }
    },
    async created () {
        const res = await this.$http.initialRequest<{ teamInfos: TeamInfo[], selfTeamInfo: TeamInfo }>('/aspire/query');

        if (!this.$http.isError(res)) {
            this.$store.commit('aspire/setTeamInfos', res.teamInfos);
            this.$store.commit('aspire/setSelfTeamInfo', res.selfTeamInfo);
        }
    },
    methods: {
    },
});
</script>
