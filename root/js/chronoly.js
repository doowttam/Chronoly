//
// Chronoly.js
//
// Init and utility functions for the app
//

var api_token = '';
var basecamp_url = '';
var base_url = '';
var user_id;

function init() {
    air.trace('init');

    window.htmlLoader.authenticate = false;  
	window.nativeWindow.addEventListener(air.Event.CLOSING, closeAllWindows);
    setUpUpdater();

    // Add onClick handlers
    document.getElementById('settings_link').addEventListener("click", showSettings);
    document.getElementById('about_link').addEventListener("click", showAbout);
    document.getElementById('help_link').addEventListener("click", showHelp);
    document.getElementById('settings_help_link').addEventListener("click", showHelp);
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
            hideLoading();
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
        initialRequest();
    }

    // Periodically get new time reports (just in case time was added through the
    // Basecamp ui
    setInterval( getTimeReports, hoursToMS(0.5) );
}

function setUpUpdater() {
    var appUpdater = new runtime.air.update.ApplicationUpdaterUI(); 
    appUpdater.configurationFile = new air.File("app:/updateFramework/updateConfig.xml"); 
    appUpdater.initialize();
}

function initialRequest() {
    // Get their user id from Basecamp. We could cache this, but this request on
    // start up is an oppertunity to test their credentials and make sure
    // everything is in working order.
    $.get( base_url + '/me.xml', function(data) {
        user_id = $(data).find('person > id').text();
        
        $('#splashScreen').css('display', 'none');
        $('#mainWindow').css('display', 'block');
        
        getTimeReports();
        getProjectList();
    });
}

function checkSettings() {
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
    api_token = $('#api_token').val();
    basecamp_url = $('#basecamp_url').val();
    base_url = 'https://' + basecamp_url + '.basecamphq.com';

    $.ajax({
        url: base_url + '/me.xml',
        success: function(data) {
            var bytes = new air.ByteArray(); 
            bytes.writeUTFBytes(api_token); 
            air.EncryptedLocalStore.setItem("api_token", bytes);

            bytes = new air.ByteArray();
            bytes.writeUTFBytes(basecamp_url); 
            air.EncryptedLocalStore.setItem("basecamp_url", bytes);

            user_id = $(data).find('person > id').text();

            hideSettings();
            initialRequest();
        }
    });

}

function show_message(msg) {
    $('#main_msg').text(msg);
    $('#main_msg').css('display', 'block');
    setTimeout( function() { 
    $('#main_msg').css('display', 'none');
        $('#main_msg').text(''); 
    }, 5000 );
}

function showLoading() {
    $('#loading').css('display', 'block');
}

function hideLoading() {
    $('#loading').css('display', 'none');
}

function msToHours(ms) {
    return ms / 3600000;
}

function hoursToMS(hours) {
    return hours * 3600000;
}

function showHelp() {
    openWindow("/root/help.html");
}

function showAbout() {
    openWindow("/root/about.html");
}

function openWindow(path) {
    var options = new air.NativeWindowInitOptions(); 
 
    var windowBounds = new air.Rectangle(200,250,500,400); 
    newHTMLLoader = air.HTMLLoader.createRootWindow(true, options, true, windowBounds); 
    newHTMLLoader.load(new air.URLRequest(path));
}

function closeAllWindows() {
    $.each(air.NativeApplication.nativeApplication.openedWindows, function( index, openedWindow ) {
        openedWindow.close();
    });
}
