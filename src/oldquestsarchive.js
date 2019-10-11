import Vue from 'vue';
import OldQuestArchivePage from './pages/OldQuestArchivePage.vue';

$(document).ready(function() {
    $("body").tooltip({ selector: '[data-toggle=tooltip]', trigger: 'hover', });
    var src = "../images/small.png"
    $("#load").attr("src", src);
});

new Vue({
    el: '#app',
    components: {
        OldQuestArchivePage
    },
});