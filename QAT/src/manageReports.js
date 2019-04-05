import Vue from 'vue';
import ManageReportsPage from './pages/ManageReportsPage.vue';

$(document).ready(function() {
    $("body").tooltip({ selector: '[data-toggle=tooltip]', trigger: 'hover', });
    var src = "../images/small.png"
    $("#load").attr("src", src);
});

new Vue({
    el: '#app',
    components: {
        ManageReportsPage,
    },
});
