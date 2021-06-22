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
    if(buttonPressed != 0 && player.money < COPY_FEE) {
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

    // variables to use for calculation 
    let curr_money, prev_money, property_name, dummy_pos, initial_amount = 0;
    if (id != player.id) {
        dummy_pos = idLookup[id];
    }
    if (player.condition === TOTAL_MONEY_CONDITION) initial_amount = START_MONEY;

    // find correct property to use based on condition
    if (player.condition === TOTAL_MONEY_CONDITION) { 
        property_name = "money";
    }
    else if (player.condition === DIRECT_REWARD_CONDITION) { 
        property_name = "reward";
    }
    else { 
        console.error(`Unknown condition ${player.condition} of type ${typeof(player.condition)}`);
    }


    // find current amount of [money/reward]
        // note: conditional operator used - (a) ? (b) : (c) is equivalent to "if(a) b; else c;"
    curr_money = (id == player.id) ? player[property_name] : dummyPlayers[dummy_pos][property_name];

    // find previous amount of [money/reward]
    if (trial_data[`player_${property_name}`] === undefined) prev_money = initial_amount; // edge case for first round
    else { 
        prev_money = (id == player.id) ? trial_data[`player_${property_name}`] : trial_data[`dummy_${property_name}`][dummy_pos];
    }

    return (curr_money - prev_money);
}