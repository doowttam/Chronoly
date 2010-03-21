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
    if ( api_token_bytes !== undefined )
        api_token = api_token_bytes.toString();
    if ( basecamp_url_bytes !== undefined ) {
        basecamp_url = basecamp_url_bytes.toString();
        base_url = 'https://' + basecamp_url + '.basecamphq.com';
    }

    if ( api_token === undefined || basecamp_url === undefined )
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
    });
}

function getReport(report_id, report_param_string) {
    air.trace('getReport: ' + report_param_string);
    
    $.get(base_url + '/time_entries/report.xml?' + report_param_string, function(data) {
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
    var report_param_string = 'subject_id=' + user_id + '&from=' + now_string + 'to=' + now_string;

    getReport('time_logged_today', report_param_string);
}

function getWeekReport() {

    var date = new Date();
    var now_string = date_to_string(date);
    date.setDate(date.getDate() - date.getDay());
    var start_string = date_to_string(date);
    var report_param_string = 'subject_id=' + user_id + '&from=' + start_string + 'to=' + now_string;

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

    var encodedPass = Base64.encode( api_token + ":X" );

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
        }
    });

}
