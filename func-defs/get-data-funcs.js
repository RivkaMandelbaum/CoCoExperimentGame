/* FUNCTIONS THAT USE/GET DATA SAVED BY PREVIOUS TRIALS*/

// Returns what the correct answer was in the trial with given index
// Answers are in the format of an artwork object, with id, name, and filepath
function getCorrectArtwork (index) { 
    return jsPsych.data.get().filter({'trial_index':index}).select('correct').values[0];
}
// Returns the button selected in trial with given index 
// Buttons are based on indices in the 'choices' array and (if selection in given trial was of artwork) should be converted to artwork
function getPlayerSelection(index) {  
    let trial_data = jsPsych.data.get().filter({'trial_index': index});
    return trial_data.select('button_pressed').values[0];  
}; 

// Returns whether player was correct in trial with given index.
function isPlayerCorrect(index) { 
    let pos = getPlayerSelection(index);
    let artwork_id = orderLookup[index][pos].id;
    return(getCorrectArtwork(index).id === artwork_id);
}

/* ---- Functions for dummy correctness are separated because they're based on timeline variables rather than on previous trial. ---- */ 

// Returns the art object that dummy player with given id selected in given trial 
// CURRENTLY NOT IN USE, but could be an interesting condition
function getDummySelection(id, trial_index) { 
    let i = idLookup[id];

    let data = jsPsych.data.get().filter({'trial_index': trial_index}).select('dummy_choices').values[0]; 

    if(data === null) { 
        console.warn("dummy choices cannot be null!");
        return null;
    }
    else {
        return data[i].art;
    }

}

// Returns whether dummy player with given id was correct in trial with given index
function isDummyCorrect(player_id, trial_index) { 
    let i = idLookup[player_id];

    let d_choices = jsPsych.data.get().filter({'trial_index': trial_index}).select('dummy_choices').values[0];

    if(d_choices === null){
        console.warn("dummy_choices cannot be null!");
        return null;
    }
    else{
        return d_choices[i].correct;
    }
    
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