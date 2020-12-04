$(function() {
    $('body').tooltip({ selector: '[data-toggle=tooltip]', trigger: 'hover' });

    $('#limitedEditBeatmap').on('hide.bs.modal', function() {
        $('#extendedInfo').css('z-index', '10000');
    });
});
