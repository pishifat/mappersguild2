<template>
    <div>
        <div class="row">
            <!--<add-contest />-->
            <div class="col-sm-3">
                <transition-group name="list" tag="div" class="row">
                    <contest-card
                        v-for="contest in contests"
                        :key="contest.id"
                        :contest="contest"
                    />
                </transition-group>
            </div>
            <div class="col-sm-9 container card card-body">
                <div v-if="!selectedContestId">
                    No contest selected! Choose one on the left.
                </div>
                <div v-else>
                    <contest-info
                        :contest="selectedContest"
                    />
                </div>
            </div>
        </div>

        <div class="radial-divisor" />
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { mapState, mapGetters } from 'vuex';
import ContestCard from '@components/contests/listing/ContestCard.vue';

import ContestInfo from '@components/contests/listing/ContestInfo.vue';
//import AddContest from '@components/contests/AddContest.vue';
import { Contest } from '@interfaces/contest/contest';
import contestListingModule from '@store/contests/contests';

export default defineComponent({
    name: 'ContestPage',
    components: {
        ContestCard,
        //AddContest,
        ContestInfo,
    },
    computed: {
        ...mapState([
            'loggedInUser',
        ]),
        ...mapState({
            contests: (state: any) => state.contests.contests,
            selectedContestId: (state: any) => state.contests.selectedContestId,
        }),
        ...mapGetters(['selectedContest']),
    },
    beforeCreate () {
        if (!this.$store.hasModule('contests')) {
            this.$store.registerModule('contests', contestListingModule);
        }
    },
    unmounted () {
        if (this.$store.hasModule('contests')) {
            this.$store.unregisterModule('contests');
        }
    },
    async created() {
        const contests = await this.$http.initialRequest<Contest[]>('/contests/listing/relevantInfo');

        if (!this.$http.isError(contests)) {
            this.$store.commit('setContests', contests);
        }
    },
});
</script>
