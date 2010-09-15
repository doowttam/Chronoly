//
// reports.js
//
// Functions related to reporting time from Basecamp
//

var reportRequests = 0;
var api_token;
var basecamp_url;
var base_url;
var user_id;
var projects;
 
function updateSummaries() {
    updateTodaySummary();
    updateWeekSummary();
}

function displayTotalTime(report_id, report_param_string) {
    $.get(base_url + '/time_entries/report.xml' + report_param_string, function(data) {
        var total = 0;
        $(data).find('time-entry > hours').each(function() {
            total += parseFloat($(this).text());
        });
        $('#' + report_id).html(total.toFixed(1));
    });
}

function getTodayParams() {
    var now_string = dateToString(new Date());
    var report_param_string = '?subject_id=' + user_id + '&from=' + now_string + '&to=' + now_string;
    return report_param_string;
}

function updateTodaySummary() {
    displayTotalTime('time_logged_today', getTodayParams());
}

function getWeekParams() {
    var date = new Date();
    var now_string = dateToString(date);
    date.setDate(date.getDate() - date.getDay());
    var start_string = dateToString(date);
    var report_param_string = '?subject_id=' + user_id + '&from=' + start_string + '&to=' + now_string;
    return report_param_string;
}

function updateWeekSummary() {
    displayTotalTime('time_logged_this_week', getWeekParams());
}

function getReport( params ) {
    getReportObject( params, function( time) {
        $.each(time, function( id, project ) {
            $('#title')
                .after('<div class="section" id="project_' + id + '"><h3>' + projects[id]['name']  + '</h3></div>');
            $('#project_' + id).append('<div class="section-content">' + time[id]['total'] + ' hours</div>');
        });
    });
}

function getTodayReport() { getReport( getTodayParams() ); }
function getWeekReport()  { getReport( getWeekParams()  ); }

// create projectId->todoId->hours->### structure
function getReportObject( reportParamString, callback ) {
    $.get(base_url + '/time_entries/report.xml' + reportParamString, function(data) {
        var timeData = new Object;
        $(data).find('time-entry').each(function() {
            var projectId = parseInt( $(this).find('project-id:first').text() );
            var todoId    = $(this).find('todo-item-id:first').text();
            var hours     = parseFloat( $(this).find('hours:first').text() );

//            air.trace( 'proj ' + projectId + ', td ' + todoId + ', hrs ' + hours );

            if ( typeof timeData[projectId] == "undefined" ) {
                timeData[projectId] = {};
                timeData[projectId]['name']  = projects[projectId]['name'];
                timeData[projectId]['total'] = hours;
            }
            else {
                timeData[projectId]['total'] += hours;
            }

            // if ( typeof timeData[projectId][todoId] == "undefined" ) {
            //     timeData[projectId][todoId] = getTodoDetails(todoId);
            // }
            // timeData[projectId][todoId]['hours'] += parseFloat(hours);
        });
        if ( typeof callback !== "undefined" ) {
            callback( timeData );
        }
    });
}

function getTodoDetails( id ) {
    air.trace( '    requesting todo ' + id );

    var todo = new Object;
    incrementReportRequests();
    $.get( base_url + '/todo_items/' + id + '.xml', function(data) {
        todo['name'] = $(data).find('todo-item > content:first').text();
        air.trace( 'todo name: ' + todo['name'] );
    } );
    return todo;
}



function initDetails() {
    api_token    = window.opener.api_token;
    basecamp_url = window.opener.basecamp_url;
    base_url     = window.opener.base_url;
    user_id      = window.opener.user_id;
    projects     = window.opener.projects;
    getWeekReport();
}