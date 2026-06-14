<template>
    <div>
        <div class="container card card-body py-4 my-4">
            <h4>Welcome to Aspire!</h4>
            <p><b>Aspire</b> is a beatmapping contest where the <a href="https://osu.ppy.sh/wiki/Ranking_criteria" target="_blank">Ranking Criteria</a> is thrown completely out of the window. The sky's the limit with what mappers can do with their craft.</p>
            <p>This iteration streamlines the format to 2 primary categories: <i>Visual Spectacle</i> and <i>Innovative Gameplay</i>.</p>
            <p>In addition, Aspire 6 allows for teams of up to 2 people to enter, opening the doors for even greater spectacles.</p>
            <div><a href="https://osu.ppy.sh/home/news/2026-06-14-aspire-6" target="_blank">Read the full news post here!</a></div>
            <hr />
            <h5>What is this page?</h5>
            <p>This is a hub for people to find suitable teammates for their Aspire entry. People can submit their own information here under a "mapper" or "storyboarder" role, and others can browse the listings to find potential teammates to partner up with.</p>
            <div>If you need a teammate, reach out to someone below!</div>
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
import SelfTeamInfo from '@components/teamContest/SelfTeamInfo.vue';
import TeamCard from '@components/teamContest/TeamCard.vue';

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
