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
    if (!offlineMode) {
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
        let test_return = "---- VARIABLE NOT UPDATED --- ";
        function callback(response) { 
            test_return = response;
            console.log('test_return in callback is: ', test_return);
            console.log('response in callback is: ', response);
        }

        $.ajax("player_information", {
            type: "GET",
            data: {"ID": uniqueId, 'condition': mycondition},
            success: function(data) { 
                callback(data);
                console.log('success with data: ', data);
                // console.log('success with response: ', response.player_results)
                // test_return = response.player_results;
                // console.log('test_return set to ', test_return)
                // console.log('test return field test', test_return.self_info);
            }, 
            error: function(textStatus, response){
                console.log('error', textStatus)
                console.log(response);
            }
        });
        console.log('test_return before returning', test_return);
        return test_return;
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
        trial_data.dummy_choices = new Array(numPlayers+1/*FIX*/ ).fill(null); // was numPlayers

        // if first round (or first training round), no one is copying, so decide other players' choices and return 
        copying_trial_index = trial_index - 2; 
        copying_trial_data = getDataAtIndex(copying_trial_index);

        if(copying_trial_data.trial_type !== "html-button-response" || copying_trial_data.stimulus.includes("ignore")) { 
            // update dummy choices
            for (i = 0; i < numPlayers; i++) {
                trial_data.dummy_choices[i] = rand_art(trial_index);
             }
             /*FIX*/ trial_data.dummy_choices[numPlayers] = trial_data.order[getPlayerSelection(trial_index)];
            console.log("first (training) round; no one is copying");
            return; 
        }

        // otherwise, get players who are copying
        dummy_copying_choices = copying_trial_data.dummy_choices; // {copying: bool, copying_id: null/int}, sorted in dummyChoices order

        // figure out everyone's choices (when online, the backend should do this)
        // initialize "visited" array for search
        let visited = new Array(numPlayers+1);/*FIX*/ // was numPlayers
        for(p = 0; p < numPlayers; p++) { 
            visited[p] = !dummy_copying_choices[p].copying;
            
            // since it's offline, if they're choosing, make their choice and add it to dummy_choices at this point 
            if(!dummy_copying_choices[p].copying) { 
                trial_data.dummy_choices[p] = rand_art(trial_index);
            }

        }
        /*FIX*/visited[numPlayers] = !playerState.is_copying;
        /*FIX*/if(!playerState.is_copying) trial_data.dummy_choices[numPlayers] = trial_data.order[getPlayerSelection(trial_index)];

        // dfs-type search to give each of them the choosing information here 
        for(p = 0; p <=/*FIX*/ numPlayers; p++) { // was p < numPlayers
            if (!visited[p]){
                find_art(p, trial_index);
            }
        }
        
        function find_art(p, trial_index) {
            visited[p] = true; 
            //was: let next_pos = idLookup[dummy_copying_choices[p].copying_id];
            /*FIX START*/ let next_pos;
            if (p === numPlayers) next_pos = idLookup[playerState.player_copying_id];
            else {
                let next_id = dummy_copying_choices[p].copying_id;
                (next_id == player.id) ? next_pos = numPlayers : next_pos = idLookup[next_id];
            }/*FIX END*/

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

        // DEBUG: log copying choices and artwork choices to console
        for(let i = 0; i < numPlayers; i++) { 
            let logstring = `${dummyPlayers[i].name} ---- `
            if (dummy_copying_choices[i].copying) {
                let name = (dummy_copying_choices[i].copying_id == player.id) ? player.name : dummyPlayers[idLookup[dummy_copying_choices[i].copying_id]].name;
               logstring += `copying ${name} ---- `;
            }
            logstring += `choice ${trial_data.dummy_choices[i].id}`;

            console.log(logstring);
        }
        if(playerState.is_copying) console.log(`${player.name} ---- copying ${dummyPlayers[idLookup[playerState.player_copying_id]].name} ---- choice ${trial_data.dummy_choices[numPlayers].id}`);
        else console.log(`${player.name} ---- choice ${trial_data.dummy_choices[numPlayers].id}`);
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
            result of isValidPlayer at this point
        */ 

        // update correct choice to be the id of the correct artwork in this round

        /* RECEIVE ARRAY OF MESSAGES
        SHOULD BE OBJECT WITH SAME FIELDS AS send_message ABOVE 
        THE PLACEHOLDER BELOW IS NOT IN THE CORRECT FORMAT */

        let response = 2; // Math.floor(Math.random() * NUM_IMAGES);
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