//
// reports.js
//
// Functions related to reporting time from Basecamp
//

CHRONOLY.reporter = function() { return {

    getTimeReports: function() {
        this.getTodayReport();
        this.getWeekReport();
    },
    
    getReport: function(report_id, report_param_string) {
        $.get(CHRONOLY.base_url + '/time_entries/report.xml' + report_param_string, function(data) {
            var total = 0;
            $(data).find('time-entry > hours').each(function() {
                total += parseFloat($(this).text());
            });
            $('#' + report_id).html(total.toFixed(1));
        });
    },

    getTodayReport: function() {
        var now_string = CHRONOLY.dateToString(new Date());
        var report_param_string = '?subject_id=' + CHRONOLY.user_id + '&from=' + now_string + '&to=' + now_string;
        
        this.getReport('time_logged_today', report_param_string);
    },

    getWeekReport: function() {
        var date = new Date();
        var now_string = CHRONOLY.dateToString(date);
        date.setDate(date.getDate() - date.getDay());
        var start_string = CHRONOLY.dateToString(date);
        var report_param_string = '?subject_id=' + CHRONOLY.user_id + '&from=' + start_string + '&to=' + now_string;
        
        this.getReport('time_logged_this_week', report_param_string);
    },

}}();