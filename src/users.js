import Vue from 'vue';
import UserPage from './pages/UserPage.vue';

$(document).ready(function() {
    $("body").tooltip({ selector: '[data-toggle=tooltip]', trigger: 'hover', });
    var src = "../images/small.png"
    $("#load").attr("src", src);

    $("#limitedEditBeatmap").on('hide.bs.modal', function(){
        $("#extendedInfo").css("z-index", "10000");
      });
});

new Vue({
    el: '#app',
    components: {
        UserPage
    },
});