<template>
    <div class="container card card-body py-1">
        <div v-if="contests.length" class="row">
            <contest-card
                v-for="contest in contests"
                :key="contest.id"
                class="col-sm-4 my-2"
                :contest="contest"
                :route="'screening'"
            />

            <div v-if="selectedContest">
                <hr>
                <h4 class="my-2">
                    {{ selectedContest.name }}
                </h4>
                <h5>
                    <a :href="selectedContest.download" target="_blank">
                        Download all submissions
                    </a>
                </h5>
                <div class="mb-2">
                    [screening instructions go here]
                </div>

                <transition-group
                    v-if="selectedContest.submissions.length"
                    name="list"
                    tag="div"
                    class="row"
                >
                    <submission-card
                        v-for="submission in selectedContest.submissions"
                        :key="submission.id"
                        :submission="submission"
                    />
                </transition-group>

                <p v-else class="ms-4">
                    No submissions...
                </p>
            </div>
        </div>

        <div v-else class="text-center p-3">
            No contests available for screening.
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { mapState, mapGetters } from 'vuex';
import SubmissionCard from '@components/screening/SubmissionCard.vue';
import ContestCard from '@components/contests/ContestCard.vue';
import screeningModule from '@store/screening';

export default defineComponent({
    name: 'ScreeningPage',
    components: {
        SubmissionCard,
        ContestCard,
    },
    computed: {
        ...mapState({
            contests: (state: any) => state.screening.contests,
        }),
        ...mapGetters([
            'selectedContest',
        ]),
    },
    beforeCreate () {
        if (!this.$store.hasModule('screening')) {
            this.$store.registerModule('screening', screeningModule);
        }
    },
    unmounted () {
        if (this.$store.hasModule('screening')) {
            this.$store.unregisterModule('screening');
        }
    },
    async created () {
        this.$store.commit('setContests', null);
        this.$store.commit('setSelectedContestId', null);

        const id = this.$route.query.contest;

        if (id) {
            const contest: any = await this.$http.initialRequest(`/contests/screening/searchContest/${id}`);

            if (!this.$http.isError(contest)) {
                this.$store.commit('setContests', [contest] || []);
                this.$store.commit('setSelectedContestId', id);
            }
        } else {
            const contests: any = await this.$http.initialRequest('/contests/screening/relevantInfo');

            if (!this.$http.isError(contests)) {
                this.$store.commit('setContests', contests || []);
                this.$store.commit('setSelectedContestId', null);
            }
        }


    },
});
</script>
