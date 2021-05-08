import { Contest } from '../../interfaces/contest/contest';
import { Module } from 'vuex';
import { Submission } from '../../interfaces/contest/submission';
import { MainState } from './main';

interface ContestResultsState {
    contest: Contest | null;
    submission: Submission | null;
    submissions: Submission[];
}

const store: Module<ContestResultsState, MainState> = {
    state: {
        contest: null,
        submissions: [],
        submission: null,
    },
    mutations: {
        setContest (state, contest: Contest): void {
            state.contest = contest;
        },
        setSubmissions (state, submissions: Submission[]): void {
            state.submissions = submissions;
        },
        setSubmission (state, submission: Submission): void {
            state.submission = submission;
        },
    },
};

export default store;
