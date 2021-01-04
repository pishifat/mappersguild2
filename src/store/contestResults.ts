import { Module } from 'vuex';
import { Submission } from '../../interfaces/contest/submission';
import { MainState } from './main';

interface ContestResultsState {
    submission: Submission | null;
    submissions: Submission[];
}

const store: Module<ContestResultsState, MainState> = {
    state: {
        submissions: [],
        submission: null,
    },
    mutations: {
        setSubmissions (state, submissions: Submission[]): void {
            state.submissions = submissions;
        },
        setSubmission (state, submission: Submission): void {
            state.submission = submission;
        },
    },
};

export default store;
