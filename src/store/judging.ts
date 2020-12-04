import { StoreOptions } from 'vuex';
import { Submission } from '../../interfaces/contest/submission';
import { Contest } from '../../interfaces/contest/contest';
import { Criteria } from '../../interfaces/contest/criteria';
import { Judging } from '../../interfaces/contest/judging';

interface JudgingState {
    contest: Contest | null;
    criterias: Criteria[];
    judgingDone: Judging[];
    editingSubmissionId: Submission['id'] | null;
    editingCriteriaId: Criteria['id'] | null;
}

const store: StoreOptions<JudgingState> = {
    state: {
        contest: null,
        criterias: [],
        judgingDone: [],
        editingSubmissionId: null,
        editingCriteriaId: null,
    },
    mutations: {
        setContest (state, contest: Contest): void {
            state.contest = contest;
        },
        setCriterias (state, criterias: Criteria[]): void {
            state.criterias = criterias;
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
            return state.criterias.find(c => c.id === state.editingCriteriaId);
        },
    },
};

export default store;
