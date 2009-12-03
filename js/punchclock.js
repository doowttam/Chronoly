// Your basecamp url
var baseUrl = '';

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
            if (xhr.status == 401) {
                $('#messages').text('There was a problem with your Basecamp credentials.');
                air.trace('Bad credentials');
            }

            $('.loading').fadeOut();
        } 
    });

    // Just a simple request to check the users credentials
    $.get(baseUrl + '/account.xml', function(data) {
        $('#loginLoad').fadeOut();
        $('#login').css('display', 'none');
        $('#mainWindow').css('display', 'block');
    });
}