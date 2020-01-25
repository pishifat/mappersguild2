import Vue from 'vue';
import NotificationPage from './pages/NotificationPage.vue';
import './bootstrap';
import mixins from './mixins';

Vue.mixin(mixins);

new Vue({
    el: '#app',
    components: {
        NotificationPage,
    },
});
