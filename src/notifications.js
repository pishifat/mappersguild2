import Vue from 'vue';
import NotificationPage from './pages/NotificationPage.vue';

$(document).ready(function() {
    $('body').tooltip({ selector: '[data-toggle=tooltip]', trigger: 'hover' });
    const src = '../images/small.png';
    $('#load').attr('src', src);
});

new Vue({
    el: '#app',
    components: {
        NotificationPage,
    },
});
