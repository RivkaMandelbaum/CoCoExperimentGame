/* FUNCTIONS RELATED TO SENDING/RECEIVING CHOICES */ 

// Returns object containing: players (number of players excluding self), 
// self_id, self_name, self_avatar_filepath, and player_info array
// containing id, name, and avatar_filepath for each other player
// If offline, will return dummy values of those 
function getPlayerInfo(offlineMode){
    if (offlineMode) {
        let result = {
            players: numPlayers,
            self_id: 0,
            self_name: "Self", 
            self_avatar_filepath: "images/avatar-self.png",
            player_info: [
                { 
                    id: 1, 
                    name: "Bartholomew",
                    avatar_filepath: "images/avatar1.png"
                }, 
                { 
                    id: 2,
                    name: "Edmund", 
                    avatar_filepath: "images/avatar2.png"
                },
                {
                    id: 3, 
                    name: "Clarissa", 
                    avatar_filepath: "images/avatar3.png"
                },
                {
                    id: 4, 
                    name: "Ida", 
                    avatar_filepath: "images/avatar4.png"
                }
            ]
        };
        return result; 
    }
    else{ 
        console.log("online mode");
        // PLACEHOLDER FOR ACTUAL FUNCTIONALITY
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

        let response_array = [2, 2, 2, 2]; 

        // update timeline variables 
        for (i = 0; i < numPlayers; i++) {
            jsPsych.data.get().filter({'trial_index': trial_index}).values()[0].dummy_choices[i] = response_array[i];
        }
    }
}

// If online, gets responses of who's copying who 
function getPlayersCopying(offlineMode) { 
    // send and receive information if online
    if(!offlineMode) { 
        // PLACEHOLDER FOR SENDING AND RECEIVING ACTUAL INFO
        let placeholderForResults = [{copy: true, who: 3}, {copy: false, who: 0}, {copy: false, who: 0}, {copy: false, who: 0}];
        return placeholderForResults;
    }

}