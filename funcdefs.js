/* ---- Defines functions for use in the artwork selection experiment ---- */ 


/* ---- Player creation and modification: ---- */ 

// creates a player with startAmount of money and numCorrect, numCopied, timesCopying all set to 0. numCorrect and numCopied are useful for testing and in case we want to display those later
function createPlayer() { 
    this.money = startAmount;
    this.numCorrect = 0;
    this.numCopied = 0;
    this.timesCopying = 0;   
}

// tests whether the player object is consistent and returns the player's stats as an array
function testPlayer(p) {
    if(!'money' in p || !'numCorrect' in p || !'numCopied' in p || !'timesCopying' in p) console.warn("Error! Parameter does not have correct fields.");

    let stats = [p.money, p.numCorrect, p.numCopied];
    if (p.money != startAmount + p.numCopied*payToCopy + p.numCorrect*rewardForCorrect - p.timesCopying*payToCopy) console.warn("Player error!"); 
    return stats;  
}     

// update other players in a given trial assuming up-to-date timeline variables 
// tests each player and logs to console 
function updatePlayerStats(trial_index) { 
    for (i = 0; i < numPlayers; i++) { 
            if(isDummyCorrect(i)) {
                dummyPlayers[i].money += rewardForCorrect;
                dummyPlayers[i].numCorrect ++;
            }
            console.log(`player ${i+1} ${testPlayer(dummyPlayers[i])}`); 
        }
}

/* ---- Getting previous choices and correctness: ---- */ 

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
    return jsPsych.data.get().filter({'trial_index': index}).select('clicked_correct').values[0];
}

/* ---- Functions for dummy correctness are separated because they're based on timeline variables rather than on previous trial. ---- */ 

// Returns the button dummy player i selected in previous trial 
// i should use array index of player, not player name
// buttons based on 'choices' array
function getDummySelection(i) { 
    return jsPsych.timelineVariable('dummy_choices', true)[i];
}

// Returns whether dummy player i was correct in given trial
// i should use array index of player, not player name
function isDummyCorrect(i) { 
    return getDummySelection(i) === jsPsych.timelineVariable('correct_choice', true);
}

/* ---- Functions related to sending/receiving choices ---- */ 

// If offline mode, logs to console. If online, gets responses (PENDING CHANGES BASED ON REPRESENTATION) and updates timeline variables to match. 
// Warning: will change the data object for the given trial! 
// Meant to be used after the experiment is paused, before resume. 
function getPlayersChoices(trial_index, offlineMode) { 

    // in offline mode, log and move on - will use timeline variable
    if(offlineMode) { 
        console.log("offline mode"); 
    }

    // in online mode, receive responses and update the timeline variable to match
    else { 
        // PLACEHOLDER FOR RECEIVING RESPONSES
        // SHOULD CHANGE BASED ON REPRESENTATION
        let placeholderForResponse = [2, 2, 2, 2]; 

        // update timeline variables 
        for (i = 0; i < numPlayers; i++) {
            jsPsych.data.get().filter({'trial_index': trial_index}).values()[0].dummy_choices[i] = placeholderForResponse[i];
        }
    }
}