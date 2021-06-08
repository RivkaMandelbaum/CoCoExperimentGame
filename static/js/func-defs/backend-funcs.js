/* -------------------------------------------------------------------------- */
/* Functions that send and receive data from backend. In offline mode, these  */
/* functions return dummy values, which are hard-coded.                       */
/* Much of this code contains placeholders which will be updated when the     */
/* backend has been completed.                                                */
/* Author: Rivka Mandelbaum                                                   */
/* -------------------------------------------------------------------------- */

// Gets artworks from server for the round; should be array of art objects, 
// which have the fields: id, name, filepath
function getArtworks(offlineMode, round){
    if(offlineMode){
        return offlineArts(round); 
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
        let default_condition = 0; 

        let result = {
            players: numPlayers,
            self_info: {
                id: uniqueId,
                name: "Aima (you)",
                avatar_filepath: "../static/images/aima.png",
                condition: mycondition
            }, 
            player_info: [
                { 
                    id: 10, 
                    name: "Kabu",
                    avatar_filepath: "../static/images/kabu.png",
                    condition: default_condition
                }, 
                { 
                    id: 2,
                    name: "Reku", 
                    avatar_filepath: "../static/images/reku.png",
                    condition: default_condition
                },
                {
                    id: 30, 
                    name: "Tufa", 
                    avatar_filepath: "../static/images/Tufa.png",
                    condition: default_condition
                },
                {
                    id: 4, 
                    name: "Weki", 
                    avatar_filepath: "../static/images/weki.png",
                    condition: default_condition
                }
            ]
        };
        return result; 
    }
    else{ 
        console.log("get player info: online mode placeholder")
        /* RECEIVE message as described in function comment */ 
        /* self info can still be uniqueId, mycondition, name like offlineMode */ 
    }
}

// When online, does the following:
//  1) sends message containing self choices in format described below
//  2) gets others' choices from server and updates trial data, assuming format:
    /* {
        id: int,
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
// When offline, dummy values of those
function backendArtSelections(trial_index, offlineMode) { 
    let trial_data = getDataAtIndex(trial_index);

    // in offline mode, fill with dummy values
    if(offlineMode) {  
        trial_data.dummy_choices = new Array(numPlayers).fill(null);
 
        // if first round (or first training round), no one is copying, so decide other players' choices and return 
        copying_trial_index = trial_index - 2; 
        copying_trial_data = getDataAtIndex(copying_trial_index);

        if(copying_trial_data.trial_type !== "html-button-response" || copying_trial_data.prompt !== "<div class='prompt'>Which player would you like to copy?</div>") { 
            // update dummy choices
            for (i = 0; i < numPlayers; i++) {
                trial_data.dummy_choices[i] = rand_art(trial_index);
             }
            return; 
        }

        // otherwise, get players who are copying
        dummy_copying_choices = copying_trial_data.dummy_choices; // {copying: bool, copying_id: null/int}, sorted in dummyChoices order


        // figure out everyone's choices (when online, the backend should do this)
        // initialize "visited" array for search
        let visited = new Array(numPlayers);
        for(p = 0; p < numPlayers; p++) { 
            visited[p] = !dummy_copying_choices[p].copying;
            
            // since it's offline, if they're choosing, make their choice and add it to dummy_choices at this point 
            if(!dummy_copying_choices[p].copying) { 
                trial_data.dummy_choices[p] = rand_art(trial_index);
            }

        }

        // dfs-type search to give each of them the choosing information here 
        for(p = 0; p < numPlayers; p++) { 
            if (!visited[p]){
                find_art(p, trial_index);
            }
        }
        
        function find_art(p, trial_index) {
            visited[p] = true; 
            let next_pos = idLookup[dummy_copying_choices[p].copying_id];

            // base cases: make a decision (set artwork choice) which can propogate back to the first person who copied
            if(visited[next_pos]) { 
                // if the person p is copying didn't copy, or they did but they've already been assigned a choice, assign p their info
                if(trial_data.dummy_choices[next_pos] != null) { 
                    trial_data.dummy_choices[p] = trial_data.dummy_choices[next_pos];
                }
                // if the person p is copying did copy (art is initialized to null) but they haven't been assigned a choice (art remains null), there's a loop - randomly assign a choice value
                else { 
                    // make random choice
                    trial_data.dummy_choices[p] = rand_art(trial_index);
                }
                return trial_data.dummy_choices[p];
            }
            // if the person p is copying did copy and hasn't been assigned a choice, recursively visit that person
            else { 
                trial_data.dummy_choices[p] = find_art(next_pos, trial_index);
                return trial_data.dummy_choices[p]; 
            }
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

        /* RECEIVE ARRAY OF MESSAGES
        SHOULD BE OBJECT WITH SAME FIELDS AS send_message ABOVE 
        THE PLACEHOLDER BELOW IS NOT IN THE CORRECT FORMAT */

        let response = 2; // Math.floor(Math.random() * numImages);
        let response_array = /* PLACEHOLDER */ [
            {
                id: dummyPlayers[0].id,
                artwork_chosen_id: response,
            },
            {
                id: dummyPlayers[1].id,
                artwork_chosen_id: response,
            },
            {
                id: dummyPlayers[2].id,
                artwork_chosen_id: response,
            },
            {
                id: dummyPlayers[3].id,
                artwork_chosen_id: response,
            }
        ];
        
        getDataAtIndex(trial_index).dummy_choices = [];

        // update data
        for (i = 0; i < numPlayers; i++) {
            let pos = idLookup[response_array[i].id];
            getDataAtIndex(trial_index).dummy_choices[pos] = response_array[i].artwork_chosen_id;
        }
    }
}

// picks whether and who the player is copying
function rand_copy(pos) { 
    let rand_range = Math.random() * numPlayers; //+ 1); // including yourself
    let rand_choice = Math.floor(rand_range);

    if (rand_choice == pos) { // player copies self
        return { copying: false, copying_id: null }
    }
    // else if (rand_choice == numPlayers) { // player copies you
    //     return { copying: true, copying_id: player.id }
    // }
    else { // player copies other dummy
        return { copying: true, copying_id: dummyPlayers[rand_choice].id}
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

        // determine others' choices randomly
        let copying_info = [];
        for(let i = 0; i < numPlayers; i++) { 
            let copy_choice = rand_copy(i);
            copying_info.push(copy_choice);
        }

        // determine their money changes and num_who_copied
        let delta_others = new Array(numPlayers).fill(0);
        let num_who_copied_others = new Array(numPlayers).fill(0);
        for(let i = 0; i < numPlayers; i++) { 
            let curr = copying_info[i]; 
            if (curr.copying) {
                delta_others[i] -= payToCopy; 

                let copying_pos = idLookup[curr.copying_id];
                delta_others[copying_pos] += payToCopy;
                num_who_copied_others[copying_pos]++;
            }
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
            }];
        for (let i = 0; i < numPlayers; i++) { 
            let player_copying_info = { 
                id: dummyPlayers[i].id,
                num_who_copied: num_who_copied_others[i],
                delta_money: delta_others[i],
                copying: copying_info[i].copying,
                copying_id: copying_info[i].copying_id, 
                trial_type: "copy",
                trial_index: trial_index
            };
            placeholder.push(player_copying_info);
        };
            

        // update the dummy that you are copying
        if(playerState.is_copying){
            let pos = idLookup[playerState.player_copying_id]+1;

            placeholder[pos].num_who_copied++;
            placeholder[pos].delta_money += delta_other; 
        } 

        // update data for the previous trial (to use in offline mode in backendArtSelections)
        let prev_trial_index = trial_index - 1;
        getDataAtIndex(prev_trial_index).dummy_choices = [];

        for (i = 0; i < numPlayers; i++) { 
            // this uses the assumption that the hard-coded "placeholder" is sorted in order of the dummyChoices array

            getDataAtIndex(prev_trial_index).dummy_choices[i] = {copying: placeholder[i+1].copying, copying_id: placeholder[i+1].copying_id};
        }

        return placeholder;
    }
}