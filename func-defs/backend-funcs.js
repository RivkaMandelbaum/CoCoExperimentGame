/* FUNCTIONS RELATED TO SENDING/RECEIVING CHOICES */ 

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