import './sass/app.scss';
import './bootstrap';
import Vue from 'vue';
import Vuex from 'vuex';
import VueRouter from 'vue-router';
import main from './store/main';
import App from './App.vue';
import routes from './routes';
import Axios from 'axios';
import mixins from './mixins';
import { User } from '@interfaces/user';

Vue.use(Vuex);
Vue.use(VueRouter);
Vue.mixin(mixins);

const store = new Vuex.Store(main);

const router = new VueRouter({
    mode: 'history',
    routes,
    linkActiveClass: 'active',
});

router.beforeEach(async (to, from, next) => {
    document.title = to.meta.title || `Mappers' Guild`;

    if (!store.state.initialized) {
        const { data } = await Axios.get<{ me: User } | { error: string }>('/me');

        if (!('error' in data)) store.commit('setInitialData', data);
    }

    next();
});

new Vue({
    store,
    router,
    render: h => h(App),
}).$mount('#app');
