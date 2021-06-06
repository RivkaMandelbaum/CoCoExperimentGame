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
    // let trial_data = jsPsych.data.get().filter({'trial_index': index});
    // return trial_data.select('button_pressed').values[0];  
    return getDataAtIndex(index).button_pressed;
}; 

/* ---- For art display wait trials ---- */
// Returns the player's reward in a given trial (based on the artwork they selected)
function getPlayerReward(index) { 
    let pos = getPlayerSelection(index);
    if (pos === null) return 0; // time ran out 

    let artwork = orderLookup[index][pos];
    return artwork.value; 
}

// Returns the dummy's reward in a given trial (based on the artwork they selected)
function getDummyReward(player_id, trial_index) { 
    let pos = idLookup[player_id];
    //let art_choice = jsPsych.data.get().filter({'trial_index': trial_index}).select('dummy_choices').values[0][pos];
    let art_choice = getDataAtIndex(trial_index).dummy_choices[pos];

    return art_choice.value;
}

/* ---- For choose to copy trial ---- */ 

// Given buttonPressed, which should be from the choose to copy trial, deals with conditional logic and returns whether the player is copying (boolean)
// assumes self = button 0
function didPlayerCopy(buttonPressed) { 

    // if time ran out, update counter and return not copying
    if (buttonPressed === null) {
        numTimeRanOut++;
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
    if(buttonPressed != 0 && player.money < payToCopy) {
        //jsPsych.data.get().filter({'trial_index': jsPsych.progress().current_trial_global - 1}).select('button_pressed').values[0] = 0; 
        getDataAtIndex(jsPsych.progress().current_trial_global - 1).button_pressed = 0;
        return false; 
    }

    // if copying return true, if not copying return false 
    if(buttonPressed != 0) return true; 
    else return false; 
}

function isValidButton(button) { 
    return (button >= 0) && (button <= numPlayers); 
}