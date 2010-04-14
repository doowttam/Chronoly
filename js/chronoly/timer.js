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
    $('#stopTimer').attr('disabled', null);
    window.document.title = 'Chronoly (Timer Running)';

    timerRunning = 1;
    $('#time_input').val(0.0);
    var startTimeStamp = new Date().valueOf();
    timerId = setInterval( function() {
        var diff = ( new Date().valueOf() - startTimeStamp ) / 3600000;
        timeSpent = diff.toFixed(1);
        $('#time_input').val(timeSpent + totalTimeSpent);
    }, 360000 );
}

function pauseTimer() {
    $('#startTimer').text('Start Timer');
    window.document.title = 'Chronoly (Timer Paused)';

    timerRunning = 0;
    clearInterval(timerId);
    totalTimeSpent = timeSpent + totalTimeSpent;
}

function resetTimer() {
    $('#startTimer').text('Start Timer');
    $('#stopTimer').attr('disabled', 'true');
    window.document.title = 'Chronoly';

    timerRunning = 0;
    clearInterval(timerId);
    totalTimeSpent = 0;
}
