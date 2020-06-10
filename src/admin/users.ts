import Vue from 'vue';
import Vuex from 'vuex';
import UserPage from '../pages/admin/UserPage.vue';
import '../bootstrap';
import mixins from '../mixins';
import toastsModule from '../modules/toasts';
import { User } from '../../interfaces/user';

Vue.mixin(mixins);
Vue.use(Vuex);

interface UserState {
    users: User[];
}

const store = new Vuex.Store<UserState>({
    modules: {
        toasts: toastsModule,
    },
    state: {
        users: [],
    },
    mutations: {
        setUsers (state, users: User[]): void {
            state.users = users;
        },
        updateBadge (state, payload): void {
            const user = state.users.find(u => u.id == payload.userId);

            if (user) {
                user.badge = payload.badge;
            }
        },
    },
    strict: process.env.NODE_ENV !== 'production',
});

new Vue({
    el: '#app',
    store,
    components: {
        UserPage,
    },
});
