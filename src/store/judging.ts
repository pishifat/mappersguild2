import { Module } from 'vuex';
import { Submission } from '../../interfaces/contest/submission';
import { Contest } from '../../interfaces/contest/contest';
import { Criteria } from '../../interfaces/contest/criteria';
import { Judging } from '../../interfaces/contest/judging';
import { MainState } from './main';

interface JudgingState {
    contest: Contest | null;
    judgingDone: Judging[];
    editingSubmissionId: Submission['id'] | null;
    editingCriteriaId: Criteria['id'] | null;
}

const store: Module<JudgingState, MainState> = {
    state: {
        contest: null,
        judgingDone: [],
        editingSubmissionId: null,
        editingCriteriaId: null,
    },
    mutations: {
        setContest (state, contest: Contest): void {
            state.contest = contest;
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
        editingSubmission: (state): Submission | undefined => {
            return state.contest?.submissions.find(s => s.id === state.editingSubmissionId);
        },
        editingCriteria: (state): Criteria | undefined => {
            return state.contest?.criterias.find(c => c.id === state.editingCriteriaId);
        },
    },
};

export default store;
