//
// Chronoly.js
//
// Init and utility functions for the app
//

var api_token = '';
var basecamp_url = '';
var base_url = '';
var user_id;
var minimized = false;

function init() {
    air.trace('init');

    window.htmlLoader.authenticate = false;
    window.nativeWindow.addEventListener(air.Event.CLOSING, cleanupAndQuit);
    setUpUpdater();

    initSysTray();

    // Add onClick handlers
    document.getElementById('settings_link').addEventListener("click", showSettings);
    document.getElementById('about_link').addEventListener("click", showAbout);
    document.getElementById('help_link').addEventListener("click", showHelp);
    document.getElementById('settings_help_link').addEventListener("click", showHelp);
    document.getElementById('close_settings_link').addEventListener("click", hideSettings);

    document.getElementById('time_logged_today').addEventListener("click", showTodayDetails);
    document.getElementById('time_logged_this_week').addEventListener("click", showWeekDetails);

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
    setInterval( updateSummaries, hoursToMS(0.5) );
}

function initSysTray() {
    var iconLoadComplete = function(event)
    {
        air.NativeApplication.nativeApplication.icon.bitmaps = [event.target.content.bitmapData];
    }

//    air.NativeApplication.nativeApplication.autoExit = false;
    var iconLoad = new air.Loader();
    var iconMenu = new air.NativeMenu();
    var exitCommand = iconMenu.addItem(new air.NativeMenuItem("Exit"));
    exitCommand.addEventListener(air.Event.SELECT,function(event){
            air.NativeApplication.nativeApplication.exit();
    });

    if (air.NativeApplication.supportsSystemTrayIcon) {
//        air.NativeApplication.nativeApplication.autoExit = false;
        iconLoad.contentLoaderInfo.addEventListener(air.Event.COMPLETE,iconLoadComplete);
        iconLoad.load(new air.URLRequest("icons/16/clock.png"));
        air.NativeApplication.nativeApplication.icon.tooltip = "AIR application";
        air.NativeApplication.nativeApplication.icon.menu = iconMenu;

        // minimize on click
        air.NativeApplication.nativeApplication.icon.addEventListener("click", minimize);
    }

    if (air.NativeApplication.supportsDockIcon) {
        iconLoad.contentLoaderInfo.addEventListener(air.Event.COMPLETE,iconLoadComplete);
        iconLoad.load(new air.URLRequest("icons/16/clock.png"));
        air.NativeApplication.nativeApplication.icon.menu = iconMenu;

        // minimize on click
        air.NativeApplication.nativeApplication.addEventListener("invoke", minimize);

    }
}

function minimize() {
    if (minimized) {
        window.nativeWindow.visible = true;
        minimized = false;
    } else {
        window.nativeWindow.visible = false;
        minimized = true;
    }
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

        $('#splash-screen').css('display', 'none');
        $('#main-window').css('display', 'block');

        updateSummaries();
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
function dateToString (date) {
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

function showMessage(msg) {
    $('#main-msg').text(msg);
    $('#main-msg').css('display', 'block');
    setTimeout( function() {
    $('#main-msg').css('display', 'none');
        $('#main-msg').text('');
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
    openWindow("/root/help.html", 500, 400);
}

function showAbout() {
    openWindow("/root/about.html", 320, 210);
}

function showTodayDetails() {
    openWindow("/root/details.html", 500, 400);
  //  getTodayReport();
}

function showWeekDetails() {
    openWindow("/root/details.html", 500, 400);
//    getWeekReport();
}

function openWindow(path, height, width) {
    var options = new air.NativeWindowInitOptions();

    var windowBounds = new air.Rectangle(200,250,height,width);
    newHTMLLoader = air.HTMLLoader.createRootWindow(true, options, true, windowBounds);
    newHTMLLoader.window.opener = window;
    newHTMLLoader.load(new air.URLRequest(path));
}

function closeAllWindows() {
    $.each(air.NativeApplication.nativeApplication.openedWindows, function( index, openedWindow ) {
        openedWindow.close();
    });
}

function cleanupSysTray() {
    air.NativeApplication.nativeApplication.icon.bitmaps = [];
}

function cleanupAndQuit() {
    closeAllWindows();
    cleanupSysTray();
}
