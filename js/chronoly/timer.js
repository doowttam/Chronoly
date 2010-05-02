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
    $('#startTimer').text('Pause');
    $('#stopTimer').attr('disabled', null);
    window.document.title = 'Chronoly (Timer Running)';
    $('#time_input').attr('disabled', 'true');

    timerRunning = 1;
    $('#time_input').val(0);
    var startTimeStamp = new Date().valueOf();
    timerId = setInterval( function() {
        var diff = ( new Date().valueOf() - startTimeStamp ) / 3600000;
        timeSpent = diff.toFixed(1);
        $('#time_input').val(timeSpent + totalTimeSpent);
    }, 360000 );
}

function pauseTimer() {
    $('#startTimer').text('Start');
    window.document.title = 'Chronoly (Timer Paused)';
    $('#time_input').attr('disabled', null);

    timerRunning = 0;
    clearInterval(timerId);
    totalTimeSpent = timeSpent + totalTimeSpent;
}

function resetTimer() {
    $('#startTimer').text('Start');
    $('#stopTimer').attr('disabled', 'true');
    window.document.title = 'Chronoly';
    $('#time_input').attr('disabled', null);

    timerRunning = 0;
    clearInterval(timerId);
    totalTimeSpent = 0;
}
