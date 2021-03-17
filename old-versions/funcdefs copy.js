/* ---- Defines functions for use in the artwork selection experiment ---- */ 


/* ---- Player creation and modification: ---- */ 

// creates a player with startAmount of money and numCorrect, numCopied, timesCopying all set to 0. numCorrect and numCopied are useful for testing and in case we want to display those later
function createPlayer(id) { 
    this.money = startAmount;
    this.numCorrect = 0;
    this.numCopied = 0;
    this.timesCopying = 0; 
    this.id = id;   
}

// tests whether the player object is consistent and returns the player's stats as an array
function testPlayer(p) {
    if(!'money' in p || !'numCorrect' in p || !'numCopied' in p || !'timesCopying' in p) console.warn("Error! Parameter does not have correct fields.");

    let stats = [p.money, p.numCorrect, p.numCopied];
    if (p.money != startAmount + p.numCopied*payToCopy + p.numCorrect*rewardForCorrect - p.timesCopying*payToCopy) console.warn("Player error!"); 
    return stats;  
}     

// update other players in a given trial assuming up-to-date timeline variables 
// using update logic from art display step - if correct, give reward
// tests each player and logs to console 
function updatePlayerStats(trial_index) { 
    for (i = 0; i < numPlayers; i++) { 
            if(isDummyCorrect(i, trial_index)) {
                dummyPlayers[i].money += rewardForCorrect;
                dummyPlayers[i].numCorrect ++;
            }
            console.log(`player ${i+1} (id ${dummyPlayers[i].id}) ${testPlayer(dummyPlayers[i])}`); 
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
    let clicked_correct_data = jsPsych.data.get().filter({'trial_index': index}).select('clicked_correct').values[0];

    if (clicked_correct_data != null) return clicked_correct_data;
    else return(getCorrectArtwork(index) === getPlayerSelection(index));
}

/* ---- Functions for dummy correctness are separated because they're based on timeline variables rather than on previous trial. ---- */ 

// Returns the button dummy player i selected in given trial 
// i should use array index of player, not player name
// buttons based on 'choices' array
function getDummySelection(i, trial_index) { 
    return jsPsych.data.get().filter({'trial_index': trial_index}).select('dummy_choices').values[0][i];
}

// Returns whether dummy player i was correct in given trial
// i should use array index of player, not player name
function isDummyCorrect(i, trial_index) { 
   let cor = jsPsych.data.get().filter({'trial_index': trial_index}).select('correct').values[0];
  
   return getDummySelection(i, trial_index) === cor;
}

/* ---- Functions related to sending/receiving choices ---- */ 

// Returns object with numPlayers, self id, and other ids as array
// If offline, will return dummy values of those 
function getPlayerInfo(){
    if(!offlineMode) { 
        console.log("online mode");
        // PLACEHOLDER FOR ACTUAL FUNCTIONALITY
    }
    else {
        let result = {players: numPlayers, self_id: 0, player_ids: [40, 50, 60, 100]};
        return result; 
    }
}

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

/* ---- Creating response strings ---- */ 
// builds stimulus string for displaySelfResults
// your choice (or choice of personcopying), whether it was correct, current money
// returns string to be used as stimulus 
function buildSelfResultsStimulus(trial_index, bIsCopying, iPlayerCopying) {
    let response = "";
    if(!bIsCopying) {
        if(getPlayerSelection(trial_index) === null) return "Your time ran out."

        let response = "Your choice was button number " + (getPlayerSelection(trial_index)+1) + ". \n"; 

        if (isPlayerCorrect(trial_index)) {
            return response + `Your answer is correct. You earned $${rewardForCorrect}.`; 
        }
        else {
            return response + "Your answer is incorrect. The correct value was: " + (getCorrectArtwork(trial_index)+1) + "."; 
        }
    }
    else { 
        response = `You chose to copy player ${iPlayerCopying}. Player ${iPlayerCopying} chose artwork ${getDummySelection(iPlayerCopying-1, trial_index) + 1}. <br> </br>`;

        if(isDummyCorrect(iPlayerCopying-1, trial_index)) {
            return response + `Player ${iPlayerCopying} was <strong> correct</strong>. You earned $${rewardForCorrect}.`;
        }
        else {
            return response + `Player ${iPlayerCopying} was <strong> incorrect</strong>. The correct value was ${getCorrectArtwork(trial_index) + 1}.`
        }
    }
}

// builds stimulus string for chooseToCopy
// displays other players' choices, correctness, money amount
// returns string to be used as stimulus
function buildCopyStimulus(trial_index) {
    s = "Here are the other player's results. <br> </br>"; 
        for(i = 0; i < numPlayers; i++) {
            if(isDummyCorrect(i, trial_index)) { 
                d_correct = "<strong> correctly </strong>"; 
                }
            else {
                d_correct = "<strong> incorrectly </strong>";
            }

            s = s.concat(`Player ${i+1} ${d_correct} chose artwork ${getDummySelection(i, trial_index) + 1}. Player ${i+1} now has $${dummyPlayers[i].money}. <br> </br>`);
        }

        // adds explanation of choice
        s = s.concat(`You may either choose the highest-value artwork on your own or pay another player $${payToCopy} to copy their choice. <br> </br> <br> </br>`);

        return s; 
}