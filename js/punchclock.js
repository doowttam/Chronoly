var api_token = '';
var basecamp_url = '';
var base_url = '';
var user_id;

function init() {
    air.trace('init');

    window.htmlLoader.authenticate = false;  

    // Add onClick handlers
    document.getElementById('settings_link').addEventListener("click", showSettings);
    document.getElementById('close_settings_link').addEventListener("click", hideSettings);

    // Set up the defaults for ajax
    $.ajaxSetup({
        contentType: 'application/xml',
        dataType: 'xml',
        timeout: 10000,
        beforeSend: function(xhr) {
            xhr.setRequestHeader("Authorization", "Basic " +  Base64.encode( api_token + ":X" ));
        },
        error: function(xhr, status_text, err) {
            air.trace('Error: ' + status_text);
            if ( status_text.match('timeout') || xhr.status == 404 ) {
                showSettings('There was a problem accessing Basecamp. Check your Basecamp url and try again.');
            } else if (xhr.status == 401) {
                air.trace('Bad credentials');
                showSettings('There was a problem with your Basecamp api token.');
            } else {
                air.Introspector.Console.log(xhr);
            }
        }
    });

    var need_settings = checkSettings();

    if ( need_settings == 1 ) {
        air.trace('need settings');
        // If we didn't pull any data out of the store give them the settings screen
        showSettings();
    } else {
        getTimeReports();
    }
}

function checkSettings() {
    air.trace('checkSettings');
    var api_token_bytes = air.EncryptedLocalStore.getItem("api_token");
    var basecamp_url_bytes = air.EncryptedLocalStore.getItem("basecamp_url");

    // Pull user data out of store
    if ( api_token_bytes != null )
        api_token = api_token_bytes.toString();
    if ( basecamp_url_bytes != null ) {
        basecamp_url = basecamp_url_bytes.toString();
        base_url = 'https://' + basecamp_url + '.basecamphq.com';
    }

    if ( api_token == '' || basecamp_url == '' )
        return 1;
    return 0;
}

function showSettings(msg) {
    air.trace('Show Settings');

    // Hack because the onclick eventhandlers pass in 
    // the event object as a parameter.
    if ( typeof msg != 'string' )
        msg = '';

    $('#settings_msg').text(msg);
    $('#basecamp_url').val(basecamp_url);
    $('#api_token').val(api_token);
    $('.settings').css('display', 'block');
}

function hideSettings() {
    $('.settings').css('display', 'none');
}

function getTimeReports() {
    air.trace('getUserId');

    // Get their user id from Basecamp. We could cache this, but this request on
    // start up is an oppertunity to test their credentials and make sure
    // everything is in working order.
    $.get( base_url + '/me.xml', function(data) {
        user_id = $(data).find('person > id').text();
        air.trace('user_id: ' + user_id);

        $('#splashScreen').css('display', 'none');
        $('#mainWindow').css('display', 'block');
        
        getTodayReport();
        getWeekReport();

        getProjectList();
    });
}

function getReport(report_id, report_param_string) {
    air.trace('getReport: ' + report_param_string);
    
    $.get(base_url + '/time_entries/report.xml' + report_param_string, function(data) {
        var total = 0;
        $(data).find('time-entry > hours').each(function() {
            total += parseFloat($(this).text());
        });
        $('#' + report_id).html(total);
    });
}

function getTodayReport() {
    
    air.trace('getTodayReport');

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

// Convert a date to YYYYMMDD format
function date_to_string (date) {
    var year = date.getFullYear().toString();
    var month = date.getMonth() + 1;
    if ( month < 10 )
        month = '0' + month;
    var date = date.getDate();
    if ( date < 10 )
        date = '0' + date;
    
    return year + month + date;
}

function verifyAndSaveSettings() {
    air.trace('verifyAndSaveSettings');

    api_token = $('#api_token').val();
    basecamp_url = $('#basecamp_url').val();
    base_url = 'https://' + basecamp_url + '.basecamphq.com';

    $.ajax({
        url: base_url + '/me.xml',
        success: function(data) {

            air.trace('Success: Storing user data in store.');
            var bytes = new air.ByteArray(); 
            bytes.writeUTFBytes(api_token); 
            air.EncryptedLocalStore.setItem("api_token", bytes);

            bytes = new air.ByteArray();
            bytes.writeUTFBytes(basecamp_url); 
            air.EncryptedLocalStore.setItem("basecamp_url", bytes);

            user_id = $(data).find('person > id').text();

            hideSettings();
            getTimeReports();
        }
    });

}

// This information could be cached locally when
// we get the todo lists, should check that out next
function getToDoItems() {
    air.trace('getToDoList');

    $('#item_select > option').remove();

    if ($(this).val() == -1)
        return;

    $.get(base_url + '/todo_lists/' + $(this).val() + '#{id}.xml', function(data) {

        $('#item_select').append('<option value="-1">Select a task</option>');

        $(data).find('todo-items > todo-item').each(function() {
            // Skip items that have been completed
            if ( $(this).children('completed').text() == 'true' )
                return;

            var todo_item_id = $(this).children('id').text();
            var todo_item_content = $(this).children('content').text();

            $('#item_select').append('<option value="' + todo_item_id + '">' + todo_item_content + '</option>');
        });

    });
}

function getToDoList() {
    air.trace('getToDoList');

    $('#todo_list_select > option').remove();
    $('#item_select > option').remove();

    if ($(this).val() == -1)
        return;

    $.get(base_url + '/projects/' + $(this).val() + '/todo_lists.xml?filter=pending', function(data) {

        $('#todo_list_select').append('<option value="-1">Select a list</option>');

        $(data).find('todo-lists > todo-list').each(function() {
            // Skip lists that don't have time tracking turned on
            if ( $(this).children('tracked').text() != 'true' )
                return;

            var todo_list_id = $(this).children('id').text();
            var todo_list_name = $(this).children('name').text();

            $('#todo_list_select').append('<option value="' + todo_list_id + '">' + todo_list_name + '</option>');
        });

        $('#todo_list_select').change(getToDoItems);

    });
}

function getProjectList() {
    air.trace('getProjectList');

    $.get(base_url + '/projects.xml', function(data) {

        $('#project_select').append('<option value="-1">Select a project</option>');

        $(data).find('projects > project').each(function() {
            if ( $(this).children('status').text() != 'active' )
                return;

            var project_id = $(this).children('id').text();
            var project_name = $(this).children('name').text();

            $('#project_select').append('<option value="' + project_id + '">' + project_name + '</option>');
        });

        $('#project_select').change(getToDoList);

    });
}

function show_message(msg) {
    $('#main_msg').text(msg);
    setTimeout( function() { $('#main_msg').text(''); }, 5000 );
}

function submitTime() {
    var item_id = $('#item_select').val();
    if (item_id == -1 || item_id == null)
        return;
    
    var date = date_to_string(new Date());;
    
    var hours = $('#time_input').val();
    // Currently just return, but really need to give
    // the user a message. Also need validation that it's a number
    if (hours == '')
        return;

    var description = $('#time_description').val();

    // FIXME: do this with jQuery instead of making it with string concatination?
    var xml = '<time-entry>'
        + '<person-id>' + user_id + '</person-id>'
        + '<date>' + date + '</date>'
        + '<hours>' + hours + '</hours>'
        + '<description>' + description + '</description>'
        + '</time-entry>'

    resetTimer();
    $('#time_loading').css('display', 'block');
    $.ajax({
        url: base_url + '/todo_items/' +  item_id + '/time_entries.xml',
        type: 'POST',
        data: xml,
        dataType: 'text',
        success: function(data, textStatus) {
            show_message('Time successfully entered!');
            $('#time_input').val('');
            $('#time_description').val('');
            $('#time_loading').css('display', 'none');
            getTimeReports();
        }
    });
}
