function init() {
    window.htmlLoader.authenticate = false;  
    checkSettings();
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

function checkSettings() {
    var api_token = air.EncryptedLocalStore.getItem("api_token");
    var basecamp_url = air.EncryptedLocalStore.getItem("basecamp_url");

    if ( api_token === undefined || basecamp_url === undefined )
        $('.settings').css('display', 'block');
}

function verifyAndSaveSettings() {
    air.trace('verifyAndSaveSettings');

    var api_token = $('#api_token').val();
    var basecamp_url = 'https://' + $('#basecamp_url').val() + '.basecamphq.com';

    var encodedPass = Base64.encode( api_token + ":X" );

    $.ajax({
        url: basecamp_url + '/me.xml',
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

            bytes.writeUTFBytes(basecamp_url); 
            air.EncryptedLocalStore.setItem("basecamp_url", bytes);

            var userId = $(data).find('person > id').text();
            bytes.writeUTFBytes(userId); 
            air.EncryptedLocalStore.setItem("basecamp_user_id", bytes);

        },
        error: function(xhr, status, err) {

            air.trace('Error');
            air.Introspector.Console.log(xhr);
            if (xhr.status == 401) {
                air.trace('Bad credentials');
            }

        }
    });

    // $.ajaxSetup({
    //     username: api_token,
    //     password: 'X',
    //     contentType: 'application/xml',
    //     dataType: 'xml',
    //     error: function(xhr, status, err) {
    //         air.trace('There was an error: ' + xhr);
    //         air.Introspector.Console.log(xhr);
    //         if (xhr.status == 401) {
    //             $('#messages').text('There was a problem with your Basecamp credentials.');
    //             air.trace('Bad credentials');
    //         }
    //     } 
    // });

    // Just a simple request to check the users credentials and get their id
    // $.get(, function(data) {
    //     air.race('Response: ' + data);
    //     userId = $(data).find('person > id').text();
    //     air.trace('success!');
    // });
}