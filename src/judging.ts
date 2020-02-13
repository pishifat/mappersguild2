import Vue from 'vue';
import Vuex from 'vuex';
import JudgingPage from './pages/JudgingPage.vue';
import './bootstrap';
import mixins from './mixins';
import toastsModule from './toasts';

Vue.mixin(mixins);
Vue.use(Vuex);

const store = new Vuex.Store({
    modules: {
        Toasts: toastsModule,
    },
    state: {
    },
    mutations: {
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
        JudgingPage,
    },
});
