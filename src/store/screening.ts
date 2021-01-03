import { Module } from 'vuex';
import { Contest } from '../../interfaces/contest/contest';
import { Submission } from '../../interfaces/contest/submission';
import { MainState } from './main';

interface ScreeningState {
    contests: Contest[];
    voteLoading: boolean;
}

const store: Module<ScreeningState, MainState> = {
    state: {
        contests: [],
        voteLoading: false,
    },
    mutations: {
        setContests (state, contests: Contest[]): void {
            state.contests = contests;
        },
        setVoteLoading (state, value: boolean): void {
            state.voteLoading = value;
        },
        updateSubmission (state, submission: Submission): void {
            let submissionIndex = -1;
            const contestIndex = state.contests.findIndex(c => {
                submissionIndex = c.submissions.findIndex(s => s.id === submission.id);

                if (submissionIndex !== -1) return true;
            });

            if (contestIndex !== -1 && submissionIndex !== -1) {
                state.contests[contestIndex].submissions[submissionIndex] = submission;
            }
        },
    },
    getters: {
        usedVotes: (state, getters, rootState): number[] => {
            const usedVotes: number[] = [];

            state.contests.forEach(c => {
                c.submissions.forEach(s => {
                    const e = s.evaluations.find(e => e.screener.id === rootState.loggedInUser?.id);

                    if (e) {
                        usedVotes.push(e.vote);
                    }
                });
            });

            return usedVotes;
        },
    },
};

export default store;
