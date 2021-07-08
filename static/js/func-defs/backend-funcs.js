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
    let trial_data = getDataAtIndex(trial_index);

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

        // DEBUG: log copying choices and artwork choices to console
        for(let i = 0; i < numPlayers; i++) { 
            let logstring = `${players[i].name} ---- `
            if (players[i].is_copying) {
                logstring += `copying ${idLookup[players[i].copying_id]} ---- `;
            }
            logstring += `choice ${players[i].art_choice.id}`;

            console.log(logstring);
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
function rand_copy(dummy_pos) { 
    let rand = Math.random() * (numPlayers + 1); // including yourself
    let rand_int = Math.floor(rand);

    // return copying: false if the player is not copying (chose self)
    if (rand_int == dummy_pos) { 
        return { copying: false, copying_id: null }
    }
    // else the player is copying; determine copying_id and return
    else { 
        let curr_copying_id = null;
        if (rand_int == dummyPlayers.length) { 
            curr_copying_id = player.id;
        }
        else {
            curr_copying_id = dummyPlayers[rand_int].id;
        }
        return { copying: true, copying_id: curr_copying_id};
    }
}

// find the most competent player in previous round for the bots to copy 
function copy_most_competent(dummy_pos, trial_index) { 
    let prev_trial_index = trial_index-5;//1;

    // create array of amount each player earned this round 
    let amount_earned_arr = dummyPlayers.map(p => getAmountEarned(prev_trial_index, p.id))
    amount_earned_arr.push(getAmountEarned(prev_trial_index, player.id)); 

            // total condition: bots assume 90% of total money is due to competence in each round
    if (player.condition == TOTAL_MONEY_CONDITION) { 
        amount_earned_arr = amount_earned_arr.map(e => e * .9);
    }
            // and check that the conditions are consistent
    else if (player.condition != DIRECT_REWARD_CONDITION) { 
        console.warn("Inconsistent conditions!");
        return { copying: false, copying_id: null};
    }

    // find the most competent player(s):
    let max = -1;
    let best_arr = [];
        // find maximum amount of money
    for (let i = 0; i < amount_earned_arr.length; i++) { 
        if (amount_earned_arr[i] > max) {
            max = amount_earned_arr[i];
        }
    }
        // find player(s) with this amount
    for (let i = 0; i < amount_earned_arr.length; i++) { 
        if (amount_earned_arr[i] === max) { 
            best_arr.push(i);
        }
    }
        // convert array to array of id's
    best_arr = best_arr.map(e => { if (e+1 === amount_earned_arr.length) return player.id; else return dummyPlayers[e].id;});

        // pick a player to copy
    let best_player_id = best_arr[Math.floor(Math.random() * best_arr.length)];

    // if (best_pos+1 === amount_earned_arr.length) {
    //     best_player_id = player.id;
    // }
    // else {
    //     best_player_id = dummyPlayers[best_pos].id;
    // }

    // based on best player id return whether/who copying
    if (best_player_id === dummyPlayers[dummy_pos].id) { 
        return {copying: false, copying_id: null};
    }
    else { 
        return {copying: true, copying_id: best_player_id};
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
function backendPlayersCopying(offlineMode, playerState, trial_index) { 
    // send and receive information if online
    if(!offlineMode) { 
        let msg = { 
            id: player.id,
            num_was_copied: null,
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
        // determine others' choices randomly
        let copying_info = [];
        for(let i = 0; i < numPlayers; i++) { 
            //let copy_choice = rand_copy(i); // - for random copy policy
            let copy_choice = copy_most_competent(i, trial_index); // bots use competence to choose
            copying_info.push(copy_choice);
        }

        // determine money changes and num_was_copied in this round
            // if a player is copying, change: (1) their money, (2) the money of the person they're copying, (3) num_was_copied for the person they copied
            // use arrays in order of dummyPlayers with player at last index
        let delta_money = new Array(numPlayers+1).fill(0); 
        let delta_num_was_copied = new Array(numPlayers+1).fill(0); 
        let player_index = numPlayers;

        // player:
        if(playerState.is_copying) { 
            delta_money[player_index] -= COPY_FEE;

            let player_copying_pos = idLookup[playerState.player_copying_id];
            delta_money[player_copying_pos] += COPY_FEE;
            delta_num_was_copied[player_copying_pos]++; 
        }

        // dummy players:
        for(let i = 0; i < numPlayers; i++) { 
            let curr = copying_info[i]; 
            
            if (curr.copying) { 
                delta_money[i] -= COPY_FEE; 

                if(curr.copying_id == player.id) { 
                    delta_money[player_index] += COPY_FEE; 
                    delta_num_was_copied[player_index]++;
                }
                else { 
                    let copying_pos = idLookup[curr.copying_id];
                    delta_money[copying_pos] += COPY_FEE;
                    delta_num_was_copied[copying_pos]++;
                }
            }
        }

        // create array of objects with information about the given round, based on above choices
        let placeholder = [
            {
                id: player.id, 
                num_was_copied: delta_num_was_copied[player_index], 
                delta_money: delta_money[player_index],
                copying: playerState.is_copying,
                copying_id: playerState.player_copying_id,
                trial_type: "copy",
                trial_index: trial_index
            }];
        for (let i = 0; i < numPlayers; i++) { 
            let player_copying_info = { 
                id: dummyPlayers[i].id,
                num_was_copied: delta_num_was_copied[i],
                delta_money: delta_money[i],
                copying: copying_info[i].copying,
                copying_id: copying_info[i].copying_id, 
                trial_type: "copy",
                trial_index: trial_index
            };
            placeholder.push(player_copying_info);
        };
            
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