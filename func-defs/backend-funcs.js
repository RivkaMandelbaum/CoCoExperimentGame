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
        /* expects to receive an array of objects, each object
        in the format: {id: (id), name: (name), avatar_filepath: (avatar's filepath)}, and returns that array */ 
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
        send_message = { 
            id: player.id, 
            correct: null,
            copying: bIsCopying, 
            copying_id: dummyPlayers[iPlayerCopying-1].id, 
            artwork_chosen_id: null,
            artwork_chosen_filepath: null,
            artwork_chosen_position: null,
            trial_type: "art",
            trial_index: (trial_index+1)
        }

        /* SEND MESSAGE! */ 

        updated_correct_choice = /* PLACEHOLDER - SHOULD GET THIS FROM THE SERVER*/ jsPsych.data.get().filter({'trial_index': trial_index}).values()[0].correct; 

        jsPsych.data.get().filter({'trial_index': trial_index}).values[0].correct = updated_correct_choice; 

        /* RECEIVE ARRAY OF MESSAGES
        SHOULD BE OBJECT WITH SAME FIELDS AS send_message ABOVE 
        THE PLACEHOLDER BELOW IS NOT IN THE CORRECT FORMAT */

        let response_array = /* PLACEHOLDER */ [{id: 1, artwork_chosen_id: 2}, {id: 2, artwork_chosen_id: 2}, {id:3, artwork_chosen_id: 2}, {id: 4, artwork_chosen_id: 2}]; 

        // update timeline variables 
        for (i = 0; i < numPlayers; i++) {
            let pos = idLookup[response_array[i].id];
            jsPsych.data.get().filter({'trial_index': trial_index}).values()[0].dummy_choices[pos] = response_array[i].artwork_chosen_id;
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

// given a player id, returns the locally saved player object with that id
function convertIdToPlayer(id) { 
    pos = idLookup[id]; 
    return dummyPlayers[pos]; 
}