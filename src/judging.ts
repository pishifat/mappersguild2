import Vue from 'vue';
import Vuex from 'vuex';
import JudgingPage from './pages/JudgingPage.vue';
import './bootstrap';
import mixins from './mixins';
import toastsModule from './modules/toasts';
import { Submission } from '../interfaces/contest/submission';
import { Contest } from '../interfaces/contest/contest';
import { Criteria } from '../interfaces/contest/criteria';
import { Judging } from '../interfaces/contest/judging';

Vue.mixin(mixins);
Vue.use(Vuex);

interface JudgingState {
    contest: Contest | null;
    criterias: Criteria[];
    judgingDone: Judging[];
    editingSubmissionId: Submission['id'] | null;
    editingCriteriaId: Criteria['id'] | null;
}

const store = new Vuex.Store<JudgingState>({
    modules: {
        toasts: toastsModule,
    },
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
});

new Vue({
    el: '#app',
    store,
    components: {
        JudgingPage,
    },
});
