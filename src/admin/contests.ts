import Vue from 'vue';
import Vuex from 'vuex';
import ContestPage from '../pages/admin/ContestPage.vue';
import '../bootstrap';
import mixins from '../mixins';
import toastsModule from '../modules/toasts';
import { Contest } from '../../interfaces/contest/contest';

Vue.mixin(mixins);
Vue.use(Vuex);

interface ContestState {
    contests: Contest[];
}

const store = new Vuex.Store<ContestState>({
    modules: {
        toasts: toastsModule,
    },
    state: {
        contests: [],
    },
    mutations: {
        setContests (state, contests: Contest[]): void {
            state.contests = contests;
        },
        addContest (state, contest: Contest): void {
            state.contests.push(contest);
        },
        addSubmission (state, payload): void {
            const contest = state.contests.find(c => c.id == payload.contestId);
            contest?.submissions.push(payload.submission);
        },
        deleteSubmission (state, payload): void {
            const contest = state.contests.find(c => c.id == payload.contestId);

            if (contest) {
                const submissionIndex = contest.submissions.findIndex(s => s.id == payload.submissionId);

                if (submissionIndex !== -1) {
                    contest.submissions.splice(submissionIndex, 1);
                }
            }
        },
        updateCreator (state, payload): void {
            const contest = state.contests.find(c => c.id == payload.contestId);

            if (contest) {
                const submissionIndex = contest.submissions.findIndex(s => s.id == payload.submissionId);

                if (submissionIndex !== -1) {
                    contest.submissions[submissionIndex].creator = payload.creator;
                }
            }
        },
        addScreener (state, payload): void {
            const contest = state.contests.find(c => c.id == payload.contestId);
            contest?.screeners.push(payload.screener);
        },
        deleteScreener (state, payload): void {
            const contest = state.contests.find(c => c.id == payload.contestId);

            if (contest) {
                const screenerIndex = contest.screeners.findIndex(s => s.id == payload.screenerId);

                if (screenerIndex !== -1) {
                    contest.screeners.splice(screenerIndex, 1);
                }
            }
        },
        toggleActivity (state, payload): void {
            const contest = state.contests.find(c => c.id == payload.contestId);

            if (contest) {
                contest.isActive = payload.isActive;
            }
        },
        updateContestStart (state, payload): void {
            const contest = state.contests.find(c => c.id == payload.contestId);

            if (contest) {
                contest.contestStart = payload.contestStart;
            }
        },
        updateScreeningStart (state, payload): void {
            const contest = state.contests.find(c => c.id == payload.contestId);

            if (contest) {
                contest.screeningStart = payload.screeningStart;
            }
        },
        updateResultsPublished (state, payload): void {
            const contest = state.contests.find(c => c.id == payload.contestId);

            if (contest) {
                contest.resultsPublished = payload.resultsPublished;
            }
        },
    },
    strict: process.env.NODE_ENV !== 'production',
});

new Vue({
    el: '#app',
    store,
    components: {
        ContestPage,
    },
});
