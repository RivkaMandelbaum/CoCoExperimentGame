/* -------------------------------------------------------------------------- */
/* Functions that deal with countdown timer display.                          */
/* Author: Rivka Mandelbaum                                                   */
/* -------------------------------------------------------------------------- */

function startTimer(timeLimit) {
    let timeLeft = timeLimit; 

    document.getElementById("countdown-timer").innerHTML = 
            `<div id = "timer-label-id" class = "timer-label">
                    ${formatTime(timeLeft)}
            </div>`;

    let timePassed = 0; 
    timerInterval = setInterval(function() {
        if (timeLeft <= 0) clearInterval(timerInterval);

        timePassed++; 
        timeLeft = timeLimit - timePassed; 

        document.getElementById("timer-label-id").innerHTML = formatTime(timeLeft);
    }, 1000)
    return timerInterval;
}

function formatTime(time) { 
    let minutes = Math.floor(time / 60); 

    if (minutes < 10) { 
        if (minutes < 0) minutes = 0; 
        minutes = `0${minutes}`;
    }

    let seconds = time % 60; 

    if (seconds < 10) { 
        if (seconds < 0 ) seconds = 0;
        seconds = `0${seconds}`;
    }

    return `${minutes}:${seconds}`;
}