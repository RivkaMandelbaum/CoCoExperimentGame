/* -------------------------------------------------------------------------- */
/* Functions that get data saved by previous trials.                          */
/* Author: Rivka Mandelbaum                                                   */
/* -------------------------------------------------------------------------- */

// Returns the data associated with a given trial index
// Will return undefined if does not exist! 
function getDataAtIndex(index) { 
    let data = jsPsych.data.get().filter({'trial_index':index});
    if (data != undefined) { 
        data = data.values()[0];
    }
    else { 
        console.warn("Error in getDataAtIndex: data does not exist.")
    }
    return data;
}

// Returns the button selected in trial with given index, represented as the button's index in the "choices" array
function getPlayerSelection(index) {  
    return getDataAtIndex(index).button_pressed;
}; 

/* ---- For choose to copy trial ---- */ 

// Given buttonPressed, which should be from the choose to copy trial, deals with conditional logic and returns whether the player is copying (boolean)
// assumes self = button 0
function didPlayerCopy(buttonPressed) { 

    // button is null means time ran out
    if (buttonPressed === null) {
        return false; 
    }

    // if the button isn't valid, log warning and set copying to false
    if (!isValidButton(buttonPressed)) {
        console.warn("Invalid player choice!");
        return false; 
    }

    // at this point only valid button choices should be possible
    // if they tried to copy but don't have enough money, reset their choice to be not copying
    // this shouldn't occur, but is here in case it happens somehow
    if(buttonPressed != 0 && self.money < COPY_FEE) {
        getDataAtIndex(jsPsych.progress().current_trial_global - 1).button_pressed = 0;
        return false; 
    }

    // if copying return true, if not copying return false 
    if(buttonPressed != 0) return true; 
    else return false; 
}

// returns whether the button number is valid for choose to copy trial
function isValidButton(button) { 
    return (button >= 0) && (button < numPlayers); 
}