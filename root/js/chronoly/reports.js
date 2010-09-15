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

function getWeekReport() {
    air.trace( 'week report' );
    var tableTemplate = '<table><tr><td>Todo</td><td>Time</td></tr></table>';

    var timeData = getReportObject( getWeekParams() );

    // air.trace( '----------' );
    // PROJLOOP:
    // for ( var projectId in timeData ) {
    //     if ( projectId == "name" ) {
    //         continue PROJLOOP;
    //     }
    //     var project = timeData['projectId'];
    //     air.trace( project['name'] );

    //     // output header
    //     $('<div/>')
    //         .after('<div><h3>' + project['name'] + '</h3>' + tableTemplate + '</div>')
    //         .appendTo('body');

    //     TODOLOOP:
    //     for ( var todoId in project ) {
    //         if ( projectId == "name" ) {
    //             continue TODOLOOP;
    //         }

    //     // output todos
    //     }
    // }

      //  air.trace( $("body").text() );

}

function getTodayReport() {

    var timeData = getReportObject( getTodayParams() );

}

function incrementReportRequests() {
    if ( ++reportRequests > 4 ) {
        air.trace( 'waiting' );
        //wait
        var dt = new Date();
		dt.setTime(dt.getTime() + 2000);
		while (new Date().getTime() < dt.getTime());
        reportRequests = 0;
    }
}

// create projectId->todoId->hours->### structure
function getReportObject( reportParamString ) {
    var tableTemplate = '<table><tr><td>Todo</td><td>Time</td></tr></table>';
    var timeData = new Object;
    $.get(base_url + '/time_entries/report.xml' + reportParamString, function(data) {
        incrementReportRequests();
        air.trace( 'stuff' + data );
        $(data).find('time-entry').each(function() {
            var projectId = $(this).find('project-id:first').text();
            var todoId    = $(this).find('todo-item-id:first').text();
            var hours     = $(this).find('hours:first').text();

//            air.trace( 'proj ' + projectId + ', td ' + todoId + ', hrs ' + hours );

            if ( typeof timeData[projectId] == "undefined" ) {
                timeData[projectId] = getProjectDetails( projectId );

                $('#title')
                    .after('<div id=project_' + projectId + '>WOO!</div>')
                    .addClass('section');

                $('#project_' + projectId)
                    .after('<div><h3>tmp</h3>' + tableTemplate + '</div>');


            }
            if ( typeof timeData[projectId][todoId] == "undefined" ) {
                timeData[projectId][todoId] = getTodoDetails(todoId);
            }
            timeData[projectId][todoId]['hours'] += parseFloat(hours);
        });
    });

    return timeData;
}

function getProjectDetails( id ) {
    air.trace( 'requesting proj ' + id );

    var project = new Object;
    incrementReportRequests();
    $.get( base_url + '/projects/' + id + '.xml', function(data) {
        project['name'] = $(data).find('project > name:first').text();
        $('#project_' + id + ' > div > h3:first').append( [project]['name'] );
        air.trace( 'proj name: ' + project['name'] );
    } );
    return project;
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
    api_token = window.opener.api_token;
    basecamp_url = window.opener.basecamp_url;
    base_url = window.opener.base_url;
    user_id = window.opener.user_id;
    getWeekReport();
}