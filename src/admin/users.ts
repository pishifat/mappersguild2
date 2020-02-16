import Vue from 'vue';
import Vuex from 'vuex';
import UserPage from '../pages/admin/UserPage.vue';
import '../bootstrap';
import mixins from '../mixins';
import toastsModule from '../modules/toasts';

Vue.mixin(mixins);
Vue.use(Vuex);

const store = new Vuex.Store({
    modules: {
        toasts: toastsModule,
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
