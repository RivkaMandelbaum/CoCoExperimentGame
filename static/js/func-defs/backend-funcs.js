/* -------------------------------------------------------------------------- */
/* Functions that send and receive data from backend. In offline mode, these  */
/* functions return dummy values, which are hard-coded.                       */
/* Much of this code contains placeholders which will be updated when the     */
/* backend has been completed.                                                */
/* Author: Rivka Mandelbaum                                                   */
/* -------------------------------------------------------------------------- */

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
        setPlayerInfo(result); 
        jsPsych.resumeExperiment();
    }
    else{ 
        let request = $.ajax("player_information", {
                 type: "GET",
                 data: {"ID": uniqueId, 'condition': mycondition},
                 success: function(data) { 
                     return data;
                 }
            });

        request.done(function(data) { 
            setPlayerInfo(data.player_results);
            jsPsych.resumeExperiment();
        });
    }
}

function setPlayerInfo(initObject) { 
    numPlayers = initObject.players; 
    numOtherPlayers = numPlayers - 1; 

    // define other players 
    for (let i = 0; i < numOtherPlayers; i++) { 
        let other_info = initObject.player_info[i];
        let otherPlayer = new Player(other_info.id, other_info.name, other_info.avatar_filepath, other_info.condition);
        players.push(otherPlayer);
        idLookup[otherPlayer.id] = i;
    }
    
    // define self and add to array 
    let self_info = initObject.self_info; 
    self = new Player(self_info.id, self_info.name, self_info.avatar_filepath, parseInt(self_info.condition));
    showSidebarInfo();

    players.push(self);
    idLookup[self.id] = numPlayers - 1; 
}

// Gets artworks from server for the round; should be array of art objects, 
// which have the fields: id, name, filepath
function getArtworks(offlineMode, round){
    if (offlineMode){
        return new Promise((resolve) => {
            resolve(offlineArts(round));
        });
    }
    else { 
        return new Promise((resolve, reject) => { 
            $.ajax("artworks", {
                type: "GET",
                data: {},
                success: (data) => { 
                    resolve(data.arts);
                },
                error: (error) => reject(error),
            });
        });;
    }
}

function getArtSelections(self_selection) { 
    // single-player version: post own decision, let backend decide everyone's decisions, and receive them back from the same request
    return new Promise((resolve, reject) => { 
        $.ajax("art_selection", {
            type: "POST",
            data: {"self_selection": self_selection},
            success: (data) => { 
                resolve(data.selections);
            },
            error: (error) => reject(error),
        });
    });;

    /* 
    // multi-player version:
    let post_self_selection = $.ajax("art_selection", { 
        type: "POST",
        data: {"self_selection": self_selection},
        success: (data) => data, // not used
        error: (error) => error
    });

    // LOOP TO PING SERVER UNTIL READY HERE 
    // WHEN READY MAKE THE FOLLOWING REQUEST:
    return new Promise((resolve, reject) => { 
        $.ajax("all_art_selections", {
            type: "GET",
            data: {},
            success: (data) => { 
                resolve(data.selections);
            },
            error: (error) => reject(error),
        });
    });;  
    */ 
}
// When online, does the following:
//  1) sends message containing self choices in format described below
//  2) gets others' choices from server and updates trial data, assuming format:
    /* {
        id: int,
        artwork_chosen_id: int,
        artwork_chosen_filepath: string,
        artwork_chosen_position: int, 
        trial_type: "art",
        trial_index: int,
        round_num: int (first round = round 0)
        }
    */
// If the player is copying, artwork_chosen information is updated based on
// what the player they are copying chose
// When offline, dummy values of those
async function backendArtSelections(trial_index, offlineMode) { 
    // in offline mode, fill with dummy values
    if (offlineMode) {  
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
                // if the  player at index i is copying didn't copy, or they did but they've already been assigned a choice, assign p their info
                if(players[next_pos].art_choice != null) { 
                    players[i].art_choice = players[next_pos].art_choice;
                }
                // if the  player at index i is copying did copy (art is initialized to null) but they haven't been assigned a choice (art remains null), there's a loop - randomly assign a choice value
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

    // in online mode, send information about self, receive correct answer and responses, and update the Player objects to match
    else { 
        let art_id = (self.is_copying) ? null : self.art_choice.id; 
        let art_filepath = (self.is_copying) ? null : self.art_choice.filepath; 
        let art_pos = (self.is_copying) ? null : getPlayerSelection(trial_index); 
       
        let self_selection = { 
            id: self.id, 
            artwork_chosen_id: art_id,
            artwork_chosen_filepath: art_filepath,
            artwork_chosen_position: art_pos,
            trial_type: "art",
            trial_index: (trial_index+1),
            round_num: numExecutions
        }

        let all_selections = await getArtSelections(self_selection);
        let arts = getDataAtIndex(trial_index).order; 
        let art_ids = arts.map(a => a.id);

        for (let i = 0; i < numPlayers; i++) { 
            let curr_selection = all_selections[i];
            let curr_pos = idLookup[curr_selection.id];
            let curr_art_choice = arts[art_ids.indexOf(curr_selection.artwork_chosen_id)];

            players[curr_pos].art_choice = curr_art_choice; 
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
function find_best_players() { 
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
    }        // find player(s) with this amount
    let best_arr = [];
    for (let i = 0; i < amount_earned_arr.length; i++) { 
        if (amount_earned_arr[i] === max) { 
            best_arr.push(i);
        }
    }
        // convert to player id's 
    return best_arr = best_arr.map(i => players[i].id);
}

function copy_most_competent(curr_pos) {
    let best_arr = find_best_players();
    let best_player_id = best_arr[Math.floor(Math.random() * best_arr.length)];

    // based on best player id return whether/who copying
    if (best_player_id === players[curr_pos].id) { 
        return {is_copying: false, copying_id: null};
    }
    else { 
        return {is_copying: true, copying_id: best_player_id};
    }
}

function getCopySelections(self_selection) { 
    // single-player version
    return new Promise((resolve, reject) => { 
        $.ajax("copy_selection", {
            type: "POST",
            data: {"self_selection": self_selection},
            success: (data) => { 
                resolve(data.selections);
            },
            error: (error) => reject(error),
        });
    });;

    /* 
    // multi-player version:
    let post_self_selection = $.ajax("copy_selection", { 
        type: "POST",
        data: {"self_selection": self_selection},
        success: (data) => data, // not used
        error: (error) => error
    });

    // LOOP TO PING SERVER UNTIL READY HERE 
    // WHEN READY MAKE THE FOLLOWING REQUEST:
    return new Promise((resolve, reject) => { 
        $.ajax("all_copy_selections", {
            type: "GET",
            data: {},
            success: (data) => { 
                resolve(data.selections);
            },
            error: (error) => reject(error),
        });
    });;  
    */ 
}

// If online, sends and gets responses of who's copying who; otherwise returns placeholder. Format of message: 
/* 
    {
        id: int,
        copying: bool,
        copying_id: int, 
        trial_type: "copy",
        trial_index: int,
        round_num: int starting at 0
    }
*/ 
async function backendPlayersCopying(offlineMode, trial_index) { 
    let copy_selections = [];
    
    if (offlineMode) { 
        // determine bots' choices 
        for(let i = 0; i < numOtherPlayers; i++) { 
            /* let copy_choice = rand_copy(i); // - for random copy policy */
            let copy_choice = copy_most_competent(i); 

            let curr_selection = { 
                id: players[i].id, 
                copying: copy_choice.is_copying,
                copying_id: copy_choice.copying_id,
                trial_type: "copy",
                trial_index: trial_index, 
                round_num: numExecutions,
            };

            copy_selections.push(curr_selection);
        }

        // add self to the copy selections list 
        copy_selections.push({
            id: self.id,
            copying: self.is_copying,
            copying_id: self.copying_id,
            trial_type: "copy",
            trial_index: trial_index, 
            round_num: numExecutions,
        });
    }

    else { 
        // send and receive information to find copying info if online
        let self_selection = {
            id: self.id,
            copying: self.is_copying,
            copying_id: self.copying_id,
            trial_type: "copy",
            trial_index: trial_index, 
            round_num: numExecutions,
        };

        copy_selections = await getCopySelections(self_selection);
    }

    // determine money changes and num_was_copied in this round
        // if a player is copying, change: (1) their money, (2) the money of the person they're copying, (3) num_was_copied for the person they copied
        // use arrays in order of players array with player at last index
    let delta_money = new Array(numPlayers).fill(0); 
    let delta_num_was_copied = new Array(numPlayers).fill(0); 
    
    for (let i = 0; i < numPlayers; i++) { 
        let pos = idLookup[copy_selections[i].id];
        if (copy_selections[i].copying) {
            let copying_pos = idLookup[copy_selections[i].copying_id];

            delta_money[pos] -= COPY_FEE;
            delta_money[copying_pos] += COPY_FEE;
            delta_num_was_copied[copying_pos]++;
        }
    }

    let return_info = [];
    for (let i = 0; i < numPlayers; i++) { 
        return_info.push({
            id: players[i].id,
            num_was_copied: delta_num_was_copied[i],
            delta_money: delta_money[i],
            copying: copy_selections[i].copying,
            copying_id: copy_selections[i].copying_id,
        });
    }

    // update data for the previous trial 
    let prev_trial_index = trial_index - 1;
    let prev_copy_choices = getDataAtIndex(prev_trial_index).copy_choices;
    prev_copy_choices = [];

    for (i = 0; i < numPlayers; i++) { 
        prev_copy_choices[i] = {is_copying: return_info[i].copying, copying_id: return_info[i].copying_id};
    }
    
    return return_info;
}