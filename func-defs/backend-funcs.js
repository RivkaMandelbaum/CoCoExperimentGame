/* FUNCTIONS RELATED TO SENDING/RECEIVING INFORMATION */ 

// Gets artworks to put into timeline variables
function getArtworks(offlineMode){
    if(offlineMode){
        console.log("getting artworks in offline mode")
    }
    else { 
        console.log("placeholder for online mode")
    }
}

// Gets player info from server at start of experiment. Returns object in the format: 
    /* {
        players: int (number of players, excluding self),
        self_id: int,
        self_name: string,
        self_avatar_filepath: string,
        player_info: array of player info objects, one per player, with format: 
            {
                id: int,
                name: string,
                avatar_filepath: string,
            }
        }
    */
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
                    id: 10, 
                    name: "Bartholomew",
                    avatar_filepath: "images/avatar1.png"
                }, 
                { 
                    id: 2,
                    name: "Edmund", 
                    avatar_filepath: "images/avatar2.png"
                },
                {
                    id: 30, 
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
        console.log("get player info: online mode placeholder")
        /* RECEIVE message as described in function comment */ 
    }
}


// When online, does the following:
//  1) sends message containing self choices in format described below
//  2) gets the correct choice from server and updates trial data
//  3) gets others' choices from server and updates trial data, assuming format:
    /* {
        id: int,
        correct: bool,
        copying: bool,
        copying_id: int or null,
        artwork_chosen_id: int,
        artwork_chosen_filepath: string,
        artwork_chosen_position: int, 
        trial_type: "art",
        trial_index: int
        }
    */
// If the player is copying, artwork_chosen information is updated based on
// what the player they are copying chose
function backendArtSelections(trial_index, offlineMode) { 

    // in offline mode, log and move on - no need to update anything, uses timeline variables instead
    if(offlineMode) { 
        console.log("backend art selections: offline mode"); 
    }

    // in online mode, send information about self, receive correct answer and responses, and update the timeline variable to match
    else { 
        if(!bIsCopying) {
            let selection = getPlayerSelection(trial_index);
        }
        let send_message = { 
            id: player.id, 
            correct: null,
            copying: bIsCopying, 
            copying_id: playerCopyingID, 
            artwork_chosen_id: selection,
            artwork_chosen_filepath: null,
            artwork_chosen_position: null,
            trial_type: "art",
            trial_index: (trial_index+1)
        }

        /* SEND MESSAGE! */ 

        // update correct choice to be the id of the correct artwork in this round
        updated_correct_choice = /* PLACEHOLDER - SHOULD GET THIS FROM THE SERVER*/ jsPsych.data.get().filter({'trial_index': trial_index}).values()[0].correct; 

        jsPsych.data.get().filter({'trial_index': trial_index}).values()[0].correct = updated_correct_choice; 

        /* RECEIVE ARRAY OF MESSAGES
        SHOULD BE OBJECT WITH SAME FIELDS AS send_message ABOVE 
        THE PLACEHOLDER BELOW IS NOT IN THE CORRECT FORMAT */

        let response = 2; // Math.floor(Math.random() * numImages);
        let response_array = /* PLACEHOLDER */ [
            {
                id: dummyPlayers[0].id,
                artwork_chosen_id: response,
                correct: (updated_correct_choice == response)
            },
            {
                id: dummyPlayers[1].id,
                artwork_chosen_id: response,
                correct: (updated_correct_choice == response)
            },
            {
                id: dummyPlayers[2].id,
                artwork_chosen_id: response,
                correct: (updated_correct_choice == response)
            },
            {
                id: dummyPlayers[3].id,
                artwork_chosen_id: response,
                correct: (updated_correct_choice == response)
            }
        ];
        
    
        // update data
        for (i = 0; i < numPlayers; i++) {
            let pos = idLookup[response_array[i].id];
            jsPsych.data.get().filter({'trial_index': trial_index}).values()[0].dummy_choices[pos] = {art: response_array[i].artwork_chosen_id, correct: response_array[i].correct};
        }
    }
}

// If online, sends and gets responses of who's copying who; otherwise returns placeholder. Format of message: 
/* 
    {
        id: int,
        num_who_copied: int (number who copied you),
        delta_money: int,
        copying: bool,
        copying_id: int, 
        trial_type: "copy",
        trial_index: int
    }
*/ 
function backendPlayersCopying(offlineMode, bIsCopying, playerCopyingID, trial_index) { 
    // send and receive information if online
    if(!offlineMode) { 
        let msg = { 
            id: player.id,
            num_who_copied: null,
            delta_money: null,
            copying: bIsCopying, 
            copying_id: playerCopyingID,
            trial_type: "copy",
            trial_index: trial_index
        }
        /* SEND msg HERE*/ 

        /* RECEIVE array of objects with same fields as above */ 
    }
    else { 
        let delta_self = 0, delta_other = 0;
        if(bIsCopying) {
            delta_self -= payToCopy; 
            delta_other += payToCopy;
        }

        // create placeholder that assumes: player 1 copied player 2, player 3 copied player 0, and deals with your copy choice as well
        let placeholder = [
            {
                id: player.id, 
                num_who_copied: 0, 
                delta_money: delta_self,
                copying: bIsCopying,
                copying_id: playerCopyingID,
                trial_type: "copy",
                trial_index: trial_index
            },
            {
                id: dummyPlayers[0].id,
                num_who_copied: 1, 
                delta_money: payToCopy,
                copying: false,
                copying_id: null,
                trial_type: "copy",
                trial_index: trial_index
            },
            {
                id: dummyPlayers[1].id,
                num_who_copied: 0, 
                delta_money: -payToCopy,
                copying: true,
                copying_id: dummyPlayers[2].id,
                trial_type: "copy",
                trial_index: trial_index
            },
            {
                id: dummyPlayers[2].id,
                num_who_copied: 1, 
                delta_money: payToCopy,
                copying: false,
                copying_id: null,
                trial_type: "copy",
                trial_index: trial_index
            },
            {
                id: dummyPlayers[3].id,
                num_who_copied: 0, 
                delta_money: -payToCopy,
                copying: true,
                copying_id: dummyPlayers[0].id,
                trial_type: "copy",
                trial_index: trial_index
            }
        ];

        
        if(bIsCopying){
            let i = idLookup[playerCopyingID]+1;

            placeholder[i].num_who_copied++;
            placeholder[i].delta_money += delta_other; 
        } 

        return placeholder;
    }
}