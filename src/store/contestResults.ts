import { Module } from 'vuex';
import { Submission } from '../../interfaces/contest/submission';
import { MainState } from './main';

interface ContestResultsState {
    submission: Submission | null;
}

const store: Module<ContestResultsState, MainState> = {
    state: {
        submission: null,
    },
    mutations: {
        setSubmission (state, submission: Submission): void {
            state.submission = submission;
        },
    },
};

export default store;
