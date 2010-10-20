//
// timer.js
//
// Functions are variables related to the timer
//
// The time spent is recorded only in the #time_input text box and not in any
// local variable.
// This allows the user to make changes if they started the timer too early/late
// and not have the timer discard those changes.

CHRONOLY.timer = function() { return {

    // Holds the id for the setInterval handle so it can be 
    // cleared when we want to stop the timer
    timerId: null,
    
    startTimer: function() {
        $('#startTimer').attr('disabled', 'true');
        $('#stopTimer').attr('disabled', null);
        window.document.title = 'Chronoly (Timer Running)';
        $('#time_input').attr('disabled', 'true');
        $('#timerGraphic').css('display', 'inline');
        
        // To have the timer round up we add 0.1 to the input box
        // every time we start the timer. So, any time spent is considered
        // to be at least 6 minutes.
        this.incrementTimer();
        
        this.timerId = setInterval( this.incrementTimer, CHRONOLY.hoursToMS(0.1) );
    },
    
    incrementTimer: function() {
        if ( $('#time_input').val() == '' ) {
            $('#time_input').val(0.1)
        } else {
            var newTime = this.getTimeSpent() + 0.1;
            $('#time_input').val(newTime.toFixed(1));
        }
    },
    
    stopTimer: function() {
        $('#stopTimer').attr('disabled', 'true');
        $('#startTimer').attr('disabled', null);
        window.document.title = 'Chronoly';
        $('#time_input').attr('disabled', null);
        $('#timerGraphic').css('display', 'none');
        
        clearInterval(this.timerId);
    },
    
    getTimeSpent: function() {
        return parseFloat($('#time_input').val());
    }
    
}}();