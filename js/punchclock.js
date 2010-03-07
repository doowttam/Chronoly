// Your basecamp url
var baseUrl = '';
var userId;

function init() {}

function login() {
    // Display loading graphic
    $('.loading').fadeIn();

    $.ajaxSetup({
        username: $('#basecamp_username').val(),
        password: $('#basecamp_password').val(),
        contentType: 'application/xml',
        dataType: 'xml',
        error: function(xhr, status, err) {
            // Right now this condition will never fire
            // because Air intercepts the any 401s
            air.trace('There was an error: ' + xhr);
            air.Introspector.Console.log(xhr);
            if (xhr.status == 401) {
                $('#messages').text('There was a problem with your Basecamp credentials.');
                air.trace('Bad credentials');
            }
            $('.loading').fadeOut();
        } 
    });

    // Just a simple request to check the users credentials and get their id
    $.get(baseUrl + '/me.xml', function(data) {
        userId = $(data).find('person > id').text();
        $('.loading').fadeOut();
        $('#login').css('display', 'none');
        $('#mainWindow').css('display', 'block');
        $('.loading').fadeIn();
        getTodayReport();
    });
}

function getTodayReport() {

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
