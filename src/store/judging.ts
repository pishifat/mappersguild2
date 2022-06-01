import { Module } from 'vuex';
import { Submission } from '../../interfaces/contest/submission';
import { Contest } from '../../interfaces/contest/contest';
import { Criteria } from '../../interfaces/contest/criteria';
import { Judging } from '../../interfaces/contest/judging';
import { MainState } from './main';

interface JudgingState {
    contests: Contest[];
    selectedContestId: Contest['id'] | null;
    judgingDone: Judging[];
    editingSubmissionId: Submission['id'] | null;
    editingCriteriaId: Criteria['id'] | null;
}

const store: Module<JudgingState, MainState> = {
    state: {
        contests: [],
        selectedContestId: null,
        judgingDone: [],
        editingSubmissionId: null,
        editingCriteriaId: null,
    },
    mutations: {
        setContests (state, contests: Contest[]): void {
            state.contests = contests;
        },
        setSelectedContestId (state, id: Contest['id']): void {
            state.selectedContestId = id;
        },
        setJudgingDone (state, judgingDone: Judging[]): void {
            state.judgingDone = judgingDone;
        },
        setEditingSubmissionId (state, id: Submission['id']): void {
            state.editingSubmissionId = id;
        },
        setEditingCriteriaId (state, id: Criteria['id']): void {
            state.editingCriteriaId = id;
        },
    },
    getters: {
        selectedContest: (state): Contest | undefined => {
            return state.contests.find(c => c.id === state.selectedContestId);
        },
        editingSubmission: (state, getters): Submission | undefined => {
            return getters.selectedContest?.submissions.find(s => s.id === state.editingSubmissionId);
        },
        editingCriteria: (state, getters): Criteria | undefined => {
            return getters.selectedContest?.criterias.find(c => c.id === state.editingCriteriaId);
        },
    },
};

export default store;
