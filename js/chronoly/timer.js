//
// timer.js
//
// Functions are variables related to the timer
//

var timerId;
var timeSpent = 0;
var totalTimeSpent = 0;
var timerRunning = 0;

function toggleTimer() {
    if (timerRunning == 1) {
        pauseTimer();
    } else {
        startTimer();
    }
}

function startTimer() {
    $('#startTimer').text('Pause Timer');
    timerRunning = 1;
    var startTimeStamp = new Date().valueOf();
    timerId = setInterval( function() {
        var diff = ( new Date().valueOf() - startTimeStamp ) / 3600000;
        timeSpent = diff.toFixed(1);
        $('#time_input').val(timeSpent + totalTimeSpent);
    }, 360000 );
    $('#timer_running').css('display', 'inline');
}

function pauseTimer() {
    timerRunning = 0;
    clearInterval(timerId);
    totalTimeSpent = timeSpent + totalTimeSpent;
    $('#startTimer').text('Start Timer');
    $('#timer_running').css('display', 'none');
}

function resetTimer() {
    clearInterval(timerId);
    $('#startTimer').text('Start Timer');
    $('#timer_running').css('display', 'none');
    totalTimeSpent = 0;
}
