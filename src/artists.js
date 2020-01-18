import Vue from 'vue';
import ArtistPage from './pages/ArtistPage.vue';

$(document).ready(function() {
    $('body').tooltip({ selector: '[data-toggle=tooltip]', trigger: 'hover' });
    const src = '../images/small.png';
    $('#load').attr('src', src);
});

new Vue({
    el: '#app',
    components: {
        ArtistPage,
    },
});
