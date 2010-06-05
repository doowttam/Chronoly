//
// reports.js
//
// Functions related to reporting time from Basecamp
//

function getTimeReports() {
    getTodayReport();
    getWeekReport();
}

function getReport(report_id, report_param_string) {
    $.get(base_url + '/time_entries/report.xml' + report_param_string, function(data) {
        var total = 0;
        $(data).find('time-entry > hours').each(function() {
            total += parseFloat($(this).text());
        });
        $('#' + report_id).html(total.toFixed(1));
    });
}

function getTodayReport() {
    var now_string = date_to_string(new Date());
    var report_param_string = '?subject_id=' + user_id + '&from=' + now_string + '&to=' + now_string;

    getReport('time_logged_today', report_param_string);
}

function getWeekReport() {
    var date = new Date();
    var now_string = date_to_string(date);
    date.setDate(date.getDate() - date.getDay());
    var start_string = date_to_string(date);
    var report_param_string = '?subject_id=' + user_id + '&from=' + start_string + '&to=' + now_string;

    getReport('time_logged_this_week', report_param_string);
}
