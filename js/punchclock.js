// Your basecamp url
var baseUrl = '';

function init() {
    // Disables Air's built in authentication dialog
    window.htmlLoader.authenticate = false;
}
function login() {
    // Display loading graphic
    $('.loading').fadeIn();

    $.ajaxSetup({
        username: $('#basecamp_username').val(),
        password: $('#basecamp_password').val(),
        contentType: 'application/xml',
        dataType: 'xml',
        error: function(xhr, status, err) {
            if (xhr.status == 401) {
                $('#messages').text('There was a problem with your Basecamp credentials.');
                air.trace('Bad credentials');
            }

            $('.loading').fadeOut();
        } 
    });

    $.get(baseUrl + '/account.xml', function(data) {
        
        $('#loginLoad').fadeOut();
    });
}