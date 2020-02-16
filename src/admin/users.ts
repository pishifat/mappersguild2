import Vue from 'vue';
import UserPage from '../pages/admin/UserPage.vue';
import '../bootstrap';
import mixins from '../mixins';

Vue.mixin(mixins);

new Vue({
    el: '#app',
    components: {
        UserPage,
    },
});
