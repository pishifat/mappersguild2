import Vue from 'vue';
import Vuex from 'vuex';
import JudgingPage from './pages/JudgingPage.vue';
import './bootstrap';
import mixins from './mixins';

Vue.mixin(mixins);
Vue.use(Vuex);

interface ToastMessage {
    message: string;
    type?: 'error' | 'success' | 'info';
}

const store = new Vuex.Store({
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
