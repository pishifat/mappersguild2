import Vue from 'vue';
import Vuex from 'vuex';
import ContestPage from '../pages/admin/ContestPage.vue';
import '../bootstrap';
import mixins from '../mixins';
import toastsModule from '../modules/toasts';
import { Contest } from '../../interfaces/contest/contest';

Vue.mixin(mixins);
Vue.use(Vuex);

interface ContestState {
    contests: Contest[];
}

const store = new Vuex.Store<ContestState>({
    modules: {
        toasts: toastsModule,
    },
    state: {
        contests: [],
    },
    mutations: {
        setContests (state, contests: Contest[]): void {
            state.contests = contests;
        },
    },
    getters: {
    },
    actions: {
    },
    strict: process.env.NODE_ENV !== 'production',
});

new Vue({
    el: '#app',
    store,
    components: {
        ContestPage,
    },
});
