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
    let art_choice = getDataAtIndex(trial_index).dummy_choices[pos];

    return art_choice.value;
}

/* ---- For choose to copy trial ---- */ 

// Given buttonPressed, which should be from the choose to copy trial, deals with conditional logic and returns whether the player is copying (boolean)
// assumes self = button 0
function didPlayerCopy(buttonPressed) { 

    // if time ran out, update counter and return not copying
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
    if(buttonPressed != 0 && player.money < payToCopy) {
        getDataAtIndex(jsPsych.progress().current_trial_global - 1).button_pressed = 0;
        return false; 
    }

    // if copying return true, if not copying return false 
    if(buttonPressed != 0) return true; 
    else return false; 
}

// returns whether the button number is valid for choose to copy trial
function isValidButton(button) { 
    return (button >= 0) && (button <= numPlayers); 
}

// calculate the amount player with given id earned between this and previous round
function getAmountEarned(index, id) {
    // find trial data where it saved player_money in previous round
    let trial_data = getDataAtIndex(index);
    console.log("Current index: " + jsPsych.progress().current_trial_global)
    console.log("Index given: " + index)

    // find player's current amount of money
    let curr_money = "Error";
 
    if (id == player.id) curr_money = player.money; 
    else curr_money = dummyPlayers[idLookup[id]].money;

    // find player's previous amount of money 
    let previous_money = "Error";

    // edge case for first rounds
    if(trial_data.player_money === undefined) { 
        console.log(trial_data)
        previous_money = startAmount;
    }
    // all other trials
    else { 
        if (id == player.id) previous_money = trial_data.player_money; 
        else previous_money = trial_data.dummy_money[idLookup[id]];  
    }

    return (curr_money - previous_money);
}