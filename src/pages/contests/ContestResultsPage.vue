<template>
    <div class="container card card-body">
        <contest-results v-if="contest" />
        <submission-result v-else-if="submission" />
        <div v-else-if="submissions.length" class="row">
            <div
                v-for="submission in submissions"
                :key="submission.id"
                class="col-sm-4 my-2"
            >
                <div class="card card-level-2 card-body">
                    <p>
                        <a :href="`/contests/results?contest=${submission.contest.id}`">
                            {{ submission.contest.name }}
                        </a>
                    </p>
                    <a :href="`/contests/results?submission=${submission.id}`" class="small text-end">
                        view submission details
                    </a>
                </div>
            </div>
        </div>
        <div v-else class="text-center">
            Contests you participated in will show up here!
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { mapMutations, mapState } from 'vuex';
import resultsModule from '@store/contestResults';
import { Submission } from '@interfaces/contest/submission';
import { Contest } from '@interfaces/contest/contest';
import SubmissionResult from '@components/contests/listing/results/SubmissionResult.vue';
import ContestResults from '@components/contests/listing/results/ContestResults.vue';

export default defineComponent({
    name: 'ContestResultsPage',
    components: {
        SubmissionResult,
        ContestResults,
    },
    computed: {
        ...mapState({
            contest: (state: any) => state.contestResults.contest as Contest,
            submissions: (state: any) => state.contestResults.submissions as Submission[],
            submission: (state: any) => state.contestResults.submission as Submission,
        }),
    },
    beforeCreate () {
        if (!this.$store.hasModule('contestResults')) {
            this.$store.registerModule('contestResults', resultsModule);
        }
    },
    unmounted () {
        if (this.$store.hasModule('contestResults')) {
            this.$store.unregisterModule('contestResults');
        }
    },
    async created () {
        const contestId = this.$route.query.contest;
        const submissionId = this.$route.query.submission;
        let contest, submissions, submission;

        if (contestId) {
            contest = await this.$http.initialRequest<Submission>('/contests/results/searchContest/' + contestId);

            if (!this.$http.isError(contest)) this.setContest(contest);
        } else if (submissionId) {
            [submission, submissions] = await Promise.all([
                this.$http.initialRequest<Submission>('/contests/results/searchSubmission/' + submissionId),
                this.$http.executeGet<Submission[]>('/contests/results/participated'),
            ]);

            if (!submission || this.$http.isError(submission)) {
                this.$router.replace('/contests/results');
            } else {
                this.setSubmission(submission);
            }
        } else {
            submissions = await this.$http.initialRequest<Submission[]>('/contests/results/participated');
        }

        if (!this.$http.isError(submissions)) this.setSubmissions(submissions);
    },
    methods: {
        ...mapMutations([
            'setContest',
            'setSubmissions',
            'setSubmission',
        ]),
    },
});
</script>
