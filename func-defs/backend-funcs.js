/* -------------------------------------------------------------------------- */
/* Functions that send and receive data from backend. In offline mode, these  */
/* functions return dummy values, which are hard-coded.                       */
/* Author: Rivka Mandelbaum                                                   */
/* -------------------------------------------------------------------------- */

// Gets artworks from server for the round; should be array of art objects, 
// which have the fields: id, name, filepath
function getArtworks(offlineMode){
    if(offlineMode){
        return [img1, img2, img3, img4, img5]; // don't need to shuffle here
    }
    else { 
        /* GET ARTWORKS FROM SERVER */ 
        return /* SHOULD BE RETURNING ARTWORKS HERE */;
    }
}

// Gets player info from server at start of experiment. Returns object in the format: 
    /* {
        players: int (number of players, excluding self),
        self_info: player info object, with format: {
            id: int, 
            name: string, 
            avatar_filepath: string,
            condition: string ("easy", "medium", or "hard")
        },
        player_info: array of player info objects, one per player, with format: 
            {
                id: int,
                name: string,
                avatar_filepath: string,
                condition: string ("easy", "medium", or "hard")
            }
        }
    */
// If offline, will return dummy values of those
function getPlayerInfo(offlineMode){
    if (offlineMode) {
        let default_condition = "easy"; 

        let result = {
            players: numPlayers,
            self_info: {
                id: 0,
                name: "Me",
                avatar_filepath: "images/avatar-self.png",
                condition: default_condition
            }, 
            player_info: [
                { 
                    id: 10, 
                    name: "Bartholomew",
                    avatar_filepath: "images/avatar1.png",
                    condition: default_condition
                }, 
                { 
                    id: 2,
                    name: "Edmund", 
                    avatar_filepath: "images/avatar2.png",
                    condition: default_condition
                },
                {
                    id: 30, 
                    name: "Clarissa", 
                    avatar_filepath: "images/avatar3.png",
                    condition: default_condition
                },
                {
                    id: 4, 
                    name: "Ida", 
                    avatar_filepath: "images/avatar4.png",
                    condition: default_condition
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

    // in offline mode, fill with dummy values
    if(offlineMode) { 
        // update correct choice
        jsPsych.data.get().filter({'trial_index': trial_index}).values()[0].correct = eval(`img${(numExecutions % numImages) + 1}`); 

        // update dummy choices
        jsPsych.data.get().filter({'trial_index': trial_index}).values()[0].dummy_choices = []; 

        for (i = 0; i < numPlayers; i++) {
            let dummy_art = eval(`img${(i % numImages) + 1}`);
            let dummy_correct = (jsPsych.data.get().filter({'trial_index': trial_index}).values()[0].correct.id == dummy_art.id);

            jsPsych.data.get().filter({'trial_index': trial_index}).values()[0].dummy_choices[i] = {art: dummy_art, correct: dummy_correct};
        }
    }

    // in online mode, send information about self, receive correct answer and responses, and update the timeline variable to match
    else { 
        let pos, chosen_id, chosen_filepath = null;
        if(!playerState.is_copying) {
            pos = getPlayerSelection(trial_index);
            chosen_id = orderLookup[trial_index][pos].id;
            chosen_filepath = orderLookup[trial_index][pos].filepath;
        }
        let send_message = { 
            id: player.id, 
            correct: null,
            copying: playerState.is_copying, 
            copying_id: playerState.player_copying_id, 
            artwork_chosen_id: chosen_id,
            artwork_chosen_filepath: chosen_filepath,
            artwork_chosen_position: pos,
            trial_type: "art",
            trial_index: (trial_index+1)
        }

        /* SEND MESSAGES:
            send_message as above
            numTimeRanOut variable
        */ 

        // update correct choice to be the id of the correct artwork in this round
        updated_correct_choice = "THIS IS A PLACEHOLDER!" /* PLACEHOLDER - SHOULD GET THIS FROM THE SERVER*/ 

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
        
        jsPsych.data.get().filter({'trial_index': trial_index}).values()[0].dummy_choices = []; 
        
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
function backendPlayersCopying(offlineMode, playerState, trial_index) { 
    // send and receive information if online
    if(!offlineMode) { 
        let msg = { 
            id: player.id,
            num_who_copied: null,
            delta_money: null,
            copying: playerState.is_copying, 
            copying_id: playerState.player_copying_id,
            trial_type: "copy",
            trial_index: trial_index
        }
        /* SEND msg HERE*/ 

        /* RECEIVE array of objects with same fields as above */ 
    }
    else { 
        let delta_self = 0, delta_other = 0;
        if(playerState.is_copying) {
            delta_self -= payToCopy; 
            delta_other += payToCopy;
        }

        // create placeholder that assumes: player 1 copied player 2, player 3 copied player 0, and deals with your copy choice as well
        let placeholder = [
            {
                id: player.id, 
                num_who_copied: 0, 
                delta_money: delta_self,
                copying: playerState.is_copying,
                copying_id: playerState.player_copying_id,
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

        
        if(playerState.is_copying){
            let i = idLookup[playerState.player_copying_id]+1;

            placeholder[i].num_who_copied++;
            placeholder[i].delta_money += delta_other; 
        } 

        return placeholder;
    }
}