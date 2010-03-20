var api_token = '';
var basecamp_url = '';
var base_url = '';
var user_id;

function init() {
    air.trace('init');
    window.htmlLoader.authenticate = false;  

    var need_settings = checkSettings();

    if ( need_settings == 1 ) {
        air.trace('need settings');
        // If we didn't pull any data out of the store give them the settings screen
        showSettings();
    } else {
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
                //air.Introspector.Console.log(xhr);
                if ( status_text.match('timeout') || xhr.status == 404 ) {
                    showSettings('There was a problem accessing Basecamp. Check your Basecamp url and try again.');
                } else if (xhr.status == 401) {
                    air.trace('Bad credentials');
                    showSettings('There was a problem with your Basecamp credentials.');
                }
                // FIXME: Need a catch all for errors I didn't expect
            }
        });

        // Get their user id from Basecamp. We could cache this, but this request on
        // start up is an oppertunity to test their credentials and make sure
        // everything is in working order.
        getUserId();
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
    // FIXME show message
    $('#basecamp_url').val(basecamp_url);
    $('#api_token').val(api_token);
    $('.settings').css('display', 'block');
}

function getUserId() {
    air.trace('getUserId');

    $.get( base_url + '/me.xml', function(data) {
        user_id = $(data).find('person > id').text();
        air.trace('user_id: ' + user_id);
    });
}

function getTodayReport() {
    
    air.trace('getTodayReport');

    var now_string = date_to_string(new Date());
    var url = baseUrl + '/time_entries/report.xml?subject_id=' + userId + '&from=' + now_string + 'to=' + now_string;

    $.get(url, function(data) {
        var total = 0;
        $(data).find('time-entry > hours').each(function() {
            total += parseFloat($(this).text());
        });
        $('#time_logged_today').html(total);
        $('.loading').fadeOut();
    });
}

function getWeekReport() {

    var date = new Date();
    var now_string = date_to_string(date);
    date.setDate(date.getDate() - date.getDay());
    var start_string = date_to_string(date);
    var url = baseUrl + '/time_entries/report.xml?subject_id=' + userId + '&from=' + start_string + 'to=' + now_string;

    $.get(url, function(data) {
        var total = 0;
        $(data).find('time-entry > hours').each(function() {
            total += parseFloat($(this).text());
        });
        $('#time_logged_this_week').html(total);
        $('.loading').fadeOut();
    });
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
        contentType: 'application/xml',
        dataType: 'xml',
        beforeSend: function(xhr) {
            xhr.setRequestHeader("Authorization", "Basic " + encodedPass);
        },
        success: function(data) {

            air.trace('Success: Storing user data in store.');
            var bytes = new air.ByteArray(); 
            bytes.writeUTFBytes(api_token); 
            air.EncryptedLocalStore.setItem("api_token", bytes);

            bytes = new air.ByteArray();
            bytes.writeUTFBytes(basecamp_url); 
            air.EncryptedLocalStore.setItem("basecamp_url", bytes);

            user_id = $(data).find('person > id').text();

            $('.settings').css('display', 'none');
        },
        error: function(xhr, status, err) {

            air.trace('Error');
            air.Introspector.Console.log(xhr);
            if (xhr.status == 401) {
                air.trace('Bad credentials');
            }

        }
    });

}
