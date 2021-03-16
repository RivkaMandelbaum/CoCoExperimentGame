/* FUNCTIONS THAT USE/GET DATA SAVED BY PREVIOUS TRIALS*/

// Returns what the correct answer was in the trial with given index
// Answers are equivalent to indices in the 'choices' array
function getCorrectArtwork (index) { 
    return jsPsych.data.get().filter({'trial_index':index}).select('correct').values[0];
}
// Returns the button selected in trial with given index 
// Buttons are based on indices in the 'choices array' (should be integer between 0 and numImages-1)
function getPlayerSelection(index) {  
    let trial_data = jsPsych.data.get().filter({'trial_index': index});
    return trial_data.select('button_pressed').values[0];
}; 

// Returns whether player was correct in trial with given index.
function isPlayerCorrect(index) { 
    let clicked_correct_data = jsPsych.data.get().filter({'trial_index': index}).select('clicked_correct').values[0];

    if (clicked_correct_data != null) return clicked_correct_data;
    else return(getCorrectArtwork(index) === getPlayerSelection(index));
}

/* ---- Functions for dummy correctness are separated because they're based on timeline variables rather than on previous trial. ---- */ 

// Returns the button dummy player with given id selected in given trial 
function getDummySelection(id, trial_index) { 
    let i = idLookup[id];
    return jsPsych.data.get().filter({'trial_index': trial_index}).select('dummy_choices').values[0][i];
}

// Returns whether dummy player with given id was correct in trial with given index
function isDummyCorrect(id, trial_index) { 
   let cor = jsPsych.data.get().filter({'trial_index': trial_index}).select('correct').values[0];
  
   return getDummySelection(id, trial_index) === cor;
}

/* ---- For choose to copy trial ---- */ 

// Given buttonPressed, which should be from the choose to copy trial, deals with conditional logic and returns whether the player is copying (boolean)
function isPlayerCopying(buttonPressed) { 

    // if time ran out, alert them and return not copying
    if (buttonPressed === null) {
        alert("Your time ran out! Moving to next round.");
        return false; 
    }

    // if the button isn't valid, log warning and set copying to false
    if (!isValidButton(buttonPressed)) {
        console.warn("Invalid player choice!");
        return false; 
    }

    // at this point only valid button choices should be possible
    // if they tried to copy but don't have enough money, alert them and reset their choice to be not copying
    if(buttonPressed != 0 && player.money < payToCopy) {
        alert("You do not have enough money to copy.");
        jsPsych.data.get().filter({'trial_index': jsPsych.progress().current_trial_global - 1}).select('button_pressed').values[0] = 0; 
        return false; 
    }

    // if copying return true, if not copying return false 
    if(buttonPressed != 0) return true; 
    else return false; 
}

function isValidButton(button) { 
    return (button >= 0) && (button <= numPlayers); 
}