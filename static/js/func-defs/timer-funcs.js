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
        // clear interval (don't become negative), time ran out counter
        if (timeLeft <= 0) { 
            clearInterval(timerInterval);
            numTimeRanOut++;
            console.log("ran out of time");
        }
        if (timeLeft <= 3) { console.log("time left: " + timeLeft)}

        // normal timer functionality
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