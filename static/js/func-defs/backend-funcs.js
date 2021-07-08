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
        num_players: int (number of players),
        self_info: player info object, with format: {
            id: int, 
            name: string, 
            avatar_filepath: string,
            condition: int 
        },
        player_info: array of player info objects, one per player, with format: 
            {
                id: int,
                name: string,
                avatar_filepath: string,
                condition: int
            }
        }
    */
// If offline, will return dummy values of those
function getPlayerInfo(offlineMode){
    if (offlineMode) {
        let default_condition = 0; 

        let result = {
            num_players: numPlayers,
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
    // in offline mode, fill with dummy values
    if(offlineMode) {  
        // if first round (or first training round), no one is copying, so decide other players' choices and return 
        copying_trial_index = trial_index - 2; 
        copying_trial_data = getDataAtIndex(copying_trial_index);

        if(copying_trial_data.trial_type !== "html-button-response" || copying_trial_data.stimulus.includes("ignore")) { 
            // update dummy choices
            for (i = 0; i < numOtherPlayers; i++) {
                players[i].art_choice = rand_art(trial_index);
             }
            console.log("first (training) round; no one is copying");
            return; 
        }

        // figure out everyone's choices
        // initialize "visited" array for search
        let visited = new Array(numPlayers);
        for(i = 0; i < numPlayers; i++) { 
            visited[i] = !(players[i].is_copying);
            
            // if bot is choosing, make their choice at this point 
            if(!players[i].is_copying) { 
                if (players[i] != self) players[i].art_choice = rand_art(trial_index);
            }
            // if any player is copying, reset their art choice to null
            else {
                players[i].art_choice = null;
            }

        }

        // dfs-type search to give each of them the choosing information here 
        for(i = 0; i < numPlayers; i++) { 
            if (!visited[i]){
                find_art(i, trial_index);
            }
        }
        
        function find_art(i, trial_index) {
            visited[i] = true; 
            let next_pos = idLookup[players[i].copying_id];

            // base cases: make a decision (set artwork choice) which can propogate back to the first person who copied
            if(visited[next_pos]) { 
                // if the person player at index i is copying didn't copy, or they did but they've already been assigned a choice, assign p their info
                if(players[next_pos].art_choice != null) { 
                    players[i].art_choice = players[next_pos].art_choice;
                }
                // if the person player at index i is copying did copy (art is initialized to null) but they haven't been assigned a choice (art remains null), there's a loop - randomly assign a choice value
                else { 
                    players[i].art_choice = rand_art(trial_index);
                }
                return players[i].art_choice;
            }
            // if the person player at index i is copying did copy and hasn't been assigned a choice, recursively visit that person
            else { 
                players[i].art_choice = find_art(next_pos, trial_index);
                return players[i].art_choice; 
            }
        }

        /*// DEBUG: log copying choices and artwork choices to console
        for(let i = 0; i < numPlayers; i++) { 
            let logstring = `${players[i].name} ---- `
            if (players[i].is_copying) {
                logstring += `copying ${idLookup[players[i].copying_id]} ---- `;
            }
            logstring += `choice ${players[i].art_choice.id}`;

            console.log(logstring);
        }*/

        // save artwork choices to trial data 
        let prev_art_choices = getDataAtIndex(trial_index).art_choices; 
        prev_art_choices = [];

        for (let i = 0; i < numPlayers; i++) { 
            prev_art_choices.push(players[i].art_choice);
        }

    }

    // in online mode, send information about self, receive correct answer and responses, and update the timeline variable to match
    else { 
       let send_message = { 
            id: self.id, 
            copying: self.is_copying, 
            copying_id: self.copying_id, 
            artwork_chosen_id: self.art_choice.id,
            artwork_chosen_filepath: self.art_choice.filepath,
            artwork_chosen_position: getPlayerSelection(trial_index),
            trial_type: "art",
            trial_index: (trial_index+1)
        }

        /* SEND MESSAGES:
            send_message as above
            result of isValidPlayer at this point
        */ 

        // update correct choice to be the id of the correct artwork in this round

        /* RECEIVE ARRAY OF MESSAGES
        SHOULD BE OBJECT WITH SAME FIELDS AS send_message ABOVE 
        THE PLACEHOLDER BELOW IS NOT IN THE CORRECT FORMAT */

        let response = 2; // Math.floor(Math.random() * NUM_IMAGES);
        let response_array = /* PLACEHOLDER */ [
            {
                id: players[0].id,
                artwork_chosen_id: response,
            },
            {
                id: players[1].id,
                artwork_chosen_id: response,
            },
            {
                id: players[2].id,
                artwork_chosen_id: response,
            },
            {
                id: players[3].id,
                artwork_chosen_id: response,
            }
        ];
        
        // update data
        for (i = 0; i < numOtherPlayers; i++) {
            players[i].art_choice = response_array[i].artwork_chosen_id;
            /* TYPE MISMATCH HERE */
            console.warn("This code is buggy");
        }
    }
}

// picks whether and who the player is copying
function rand_copy(curr_pos) { 
    let rand = Math.random() * (numPlayers); 
    let rand_int = Math.floor(rand);

    // return copying: false if the player is not copying (chose self)
    if (players[rand_int] === players[curr_pos]) { 
        return { copying: false, copying_id: null }
    }
    // else the player is copying; determine copying_id and return
    else { 
        return { copying: true, copying_id: players[rand_int].id};
    }
}

// find the most competent player in previous round for the bots to copy 
function copy_most_competent(curr_pos) { 
    // create array of amount each player earned this round 
    let amount_earned_arr = players.map(p => (self.condition == TOTAL_MONEY_CONDITION) ? (.9 * p.money_earned) : p.reward_earned);

    if (self.condition != TOTAL_MONEY_CONDITION && self.condition != DIRECT_REWARD_CONDITION) {
        console.warn("Inconsistent conditions in backend-funcs!");
        return { is_copying: false, copying_id: null};
    }

    // find the most competent player(s):
            // find maximum amount of money
    let max = -1;
    for (let i = 0; i < amount_earned_arr.length; i++) { 
        if (amount_earned_arr[i] > max) {
            max = amount_earned_arr[i];
        }
    }
        // find player(s) with this amount
    let best_arr = [];
    for (let i = 0; i < amount_earned_arr.length; i++) { 
        if (amount_earned_arr[i] === max) { 
            best_arr.push(i);
        }
    }
        // convert to player id's and pick a best player
    best_arr = best_arr.map(i => players[i].id);
    let best_player_id = best_arr[Math.floor(Math.random() * best_arr.length)];

    // based on best player id return whether/who copying
    if (best_player_id === players[curr_pos].id) { 
        return {is_copying: false, copying_id: null};
    }
    else { 
        return {is_copying: true, copying_id: best_player_id};
    }
}

// If online, sends and gets responses of who's copying who; otherwise returns placeholder. Format of message: 
/* 
    {
        id: int,
        num_was_copied: int,
        delta_money: int,
        copying: bool,
        copying_id: int, 
        trial_type: "copy",
        trial_index: int
    }
*/ 
function backendPlayersCopying(offlineMode, trial_index) { 
    // send and receive information if online
    if(!offlineMode) { 
        let msg = { 
            id: self.id,
            num_was_copied: null,
            delta_money: null,
            copying: self.is_copying, 
            copying_id: self.copying_id,
            trial_type: "copy",
            trial_index: trial_index
        }
        /* SEND msg HERE*/ 

        /* RECEIVE array of objects with same fields as above */ 
    }
    else { 
        // determine bots' choices randomly
        for(let i = 0; i < numOtherPlayers; i++) { 
            /* let copy_choice = rand_copy(i); // - for random copy policy */
            let copy_choice = copy_most_competent(i); 
            players[i].is_copying = copy_choice.is_copying;
            players[i].copying_id = copy_choice.copying_id;
        }
        
        // determine money changes and num_was_copied in this round
            // if a player is copying, change: (1) their money, (2) the money of the person they're copying, (3) num_was_copied for the person they copied
            // use arrays in order of players array with player at last index
        let delta_money = new Array(numPlayers).fill(0); 
        let delta_num_was_copied = new Array(numPlayers).fill(0); 

        for (let i = 0; i < numPlayers; i++) { 
            if(players[i].is_copying) {
                let copying_pos =  idLookup[players[i].copying_id];

                delta_money[i] -= COPY_FEE;
                delta_money[copying_pos] += COPY_FEE;
                delta_num_was_copied[copying_pos]++;
            }
        }

        // create array of objects with information about the given round, based on above choices
        let placeholder = [
            {
                id: self.id, 
                num_was_copied: delta_num_was_copied[numPlayers-1], 
                delta_money: delta_money[numPlayers-1],
                copying: self.is_copying,
                copying_id: self.copying_id,
                trial_type: "copy",
                trial_index: trial_index
            }];
        for (let i = 0; i < numOtherPlayers; i++) { 
            let player_copying_info = { 
                id: players[i].id,
                num_was_copied: delta_num_was_copied[i],
                delta_money: delta_money[i],
                copying: copying_info[i].is_copying,
                copying_id: copying_info[i].copying_id, 
                trial_type: "copy",
                trial_index: trial_index
            };
            placeholder.push(player_copying_info);
        };
            
        // update data for the previous trial (to use in offline mode in backendArtSelections)
        let prev_trial_index = trial_index - 1;
        let prev_copy_choices = getDataAtIndex(prev_trial_index).copy_choices;
        prev_copy_choices = [];

        for (i = 0; i < numPlayers; i++) { 
            prev_copy_choices[i] = {is_copying: placeholder[i].copying, copying_id: placeholder[i].copying_id};
        }

        return placeholder;
    }
}