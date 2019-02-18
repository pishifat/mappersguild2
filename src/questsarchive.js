import Vue from 'vue';
import QuestArchivePage from './pages/QuestArchivePage.vue';

$(document).ready(function() {
    $("body").tooltip({ selector: '[data-toggle=tooltip]' });
    var src = "../images/small.png"
    $("#load").attr("src", src);
});

new Vue({
    el: '#app',
    components: {
        QuestArchivePage
    },
});