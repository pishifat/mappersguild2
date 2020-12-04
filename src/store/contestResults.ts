import { StoreOptions } from 'vuex';
import { Submission } from '../../interfaces/contest/submission';

interface ContestResultsState {
    submission: Submission | null;
}

const store: StoreOptions<ContestResultsState> = {
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
