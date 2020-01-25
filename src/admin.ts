import Vue from 'vue';
import Vuex from 'vuex';
import AdminPage from './pages/AdminPage.vue';
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
        toastMessages: [] as ToastMessage[],
    },
    mutations: {
        addToastMessage (state, message: ToastMessage): void {
            state.toastMessages.push(message);
        },
        removeFirstToastMessage (state): void {
            state.toastMessages.splice(0, 1);
        },
    },
    actions: {
        updateToastMessages ({ commit }, message: ToastMessage): void {
            commit('addToastMessage', message);

            setTimeout(() => {
                commit('removeFirstToastMessage');
            }, 5000);
        },
    },
    strict: process.env.NODE_ENV !== 'production',
});

new Vue({
    el: '#app',
    store,
    components: {
        AdminPage,
    },
});
