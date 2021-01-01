import 'bootstrap/js/dist/modal';
import 'bootstrap/js/dist/tooltip';
import 'bootstrap/js/dist/toast';
import 'bootstrap/js/dist/dropdown';
import 'bootstrap/js/dist/collapse';
import './sass/app.scss';
import Vue from 'vue';
import Vuex from 'vuex';
import VueRouter from 'vue-router';
import main from './store/main';
import App from './App.vue';
import routes from './routes';
import Axios from 'axios';
import mixins from './mixins';
import { User } from '@interfaces/user';
import { ErrorResponse } from '@interfaces/api/shared';
import { isError } from '@store/http';

Vue.use(Vuex);
Vue.use(VueRouter);
Vue.mixin(mixins);

export const store = new Vuex.Store(main);

const router = new VueRouter({
    mode: 'history',
    routes,
    linkActiveClass: 'active',
});

router.beforeEach(async (to, from, next) => {
    document.title = to.meta.title || `Mappers' Guild`;

    if (!store.state.initialized) {
        const { data } = await Axios.get<User | null | ErrorResponse>('/me');

        if (!isError(data)) store.commit('setInitialData', data);
    }

    next();
});

new Vue({
    store,
    router,
    render: h => h(App),
}).$mount('#app');
