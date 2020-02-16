import Vue from 'vue';
import BeatmapPage from '../pages/admin/BeatmapPage.vue';
import '../bootstrap';
import mixins from '../mixins';

Vue.mixin(mixins);

new Vue({
    el: '#app',
    components: {
        BeatmapPage,
    },
});
