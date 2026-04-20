import { Module } from 'vuex';
import { Contest } from '../../interfaces/contest/contest';
import { Submission } from '../../interfaces/contest/submission';
import { MainState } from './main';

interface CommunityVoteState {
    contests: Contest[];
    selectedContestId: Contest['id'] | null;
    voteLoading: boolean;
}

const store: Module<CommunityVoteState, MainState> = {
    state: {
        contests: [],
        selectedContestId: null,
        voteLoading: false,
    },
    mutations: {
        setContests (state, contests: Contest[]): void {
            state.contests = contests;
        },
        setSelectedContestId (state, id: Contest['id']): void {
            state.selectedContestId = id;
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
                state.contests[contestIndex].submissions[submissionIndex].communityVotes = submission.communityVotes;
            }
        },
    },
    getters: {
        selectedContest: (state): Contest | undefined => {
            return state.contests.find(c => c.id === state.selectedContestId);
        },
        usedVotes: (state, getters, rootState): number[] => {
            const contest = getters.selectedContest;

            if (!contest) return [];

            const usedVotes: number[] = [];

            contest.submissions.forEach(s => {
                const e = s.communityVotes.find(v => v.voter.id === rootState.loggedInUser?.id);

                if (e) {
                    usedVotes.push(e.vote);
                }
            });

            return usedVotes;
        },
    },
};

export default store;
