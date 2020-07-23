import Vue from 'vue';
import Vuex from 'vuex';
import ContestResultsPage from './pages/ContestResultsPage.vue';
import './bootstrap';
import mixins from './mixins';
import toastsModule from './modules/toasts';
import { Submission } from '../interfaces/contest/submission';

Vue.mixin(mixins);
Vue.use(Vuex);

interface ContestResultsState {
    submission: Submission | null;
}

const store = new Vuex.Store<ContestResultsState>({
    modules: {
        toasts: toastsModule,
    },
    state: {
        submission: null,
    },
    mutations: {
        setSubmission (state, submission: Submission): void {
            state.submission = submission;
        },
    },
});

new Vue({
    el: '#app',
    store,
    components: {
        ContestResultsPage,
    },
});
