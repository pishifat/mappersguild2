import Vue from 'vue';
import Vuex from 'vuex';
import ScreeningPage from './pages/ScreeningPage.vue';
import './bootstrap';
import mixins from './mixins';
import toastsModule from './modules/toasts';
import { Contest } from '../interfaces/contest/contest';
import { User } from '../interfaces/user';
import { Submission } from '../interfaces/contest/submission';

Vue.mixin(mixins);
Vue.use(Vuex);

interface ScreeningState {
    contests: Contest[];
    userId: User['id'];
}

const store = new Vuex.Store<ScreeningState>({
    modules: {
        toasts: toastsModule,
    },
    state: {
        contests: [],
        userId: '',
    },
    mutations: {
        setContests (state, contests: Contest[]): void {
            state.contests = contests;
        },
        setUserId (state, id: User['id']): void {
            state.userId = id;
        },
        updateSubmission (state, submission: Submission): void {
            let submissionIndex = -1;
            const contestIndex = state.contests.findIndex(c => {
                submissionIndex = c.submissions.findIndex(s => s.id === submission.id);

                if (submissionIndex !== -1) return true;
            });

            if (contestIndex !== -1 && submissionIndex !== -1) {
                Vue.set(state.contests[contestIndex].submissions, submissionIndex, submission);
            }
        },
    },
    getters: {
        usedVotes: (state): number[] => {
            const usedVotes: number[] = [];

            state.contests.forEach(c => {
                c.submissions.forEach(s => {
                    const e = s.evaluations.find(e => e.screener.id === state.userId);

                    if (e) {
                        usedVotes.push(e.vote);
                    }
                });
            });

            return usedVotes;
        },
    },
    strict: process.env.NODE_ENV !== 'production',
});

new Vue({
    el: '#app',
    store,
    components: {
        ScreeningPage,
    },
});
