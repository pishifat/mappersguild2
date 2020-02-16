import Vue from 'vue';
import QuestPage from '../pages/admin/QuestPage.vue';
import '../bootstrap';
import mixins from '../mixins';

Vue.mixin(mixins);

new Vue({
    el: '#app',
    components: {
        QuestPage,
    },
});
