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

// creates Artwork objects to return (helper to getArtworks)
function Artwork(name, id, filepath, value) { 
    this.name = name;
    this.id = id;
    this.filepath = filepath;
    this.value = value;
}

// returns hard-coded artworks
function offlineArts(round) { 
    let all_arts = [{ name: "KnowingCalm_69", id: 0, filepath: "../static/images/artworks/KnowingCalm_69.jpeg", value: 1},
    { name: "ScalingColors_69", id: 1, filepath: "../static/images/artworks/ScalingColors_69.jpeg", value: 1},
    { name: "PhoneCalls_79", id: 2, filepath: "../static/images/artworks/PhoneCalls_79.jpeg", value: 2},
    { name: "WrappedUp_79", id: 3, filepath: "../static/images/artworks/WrappedUp_79.jpeg", value: 2},
    { name: "NoahsArk_79", id: 4, filepath: "../static/images/artworks/NoahsArk_79.jpeg", value: 2},
    { name: "GhostMonster_69", id: 5, filepath: "../static/images/artworks/GhostMonster_69.jpeg", value: 1},
    { name: "DismemberedEnthusiast_79", id: 6, filepath: "../static/images/artworks/DismemberedEnthusiast_79.jpeg", value: 2},
    { name: "RunningFromHome_129", id: 7, filepath: "../static/images/artworks/RunningFromHome_129.jpeg", value: 7},
    { name: "InitialSpark_149", id: 8, filepath: "../static/images/artworks/InitialSpark_149.jpeg", value: 9},
    { name: "Composition_159", id: 9, filepath: "../static/images/artworks/Composition_159.jpeg", value: 10},
    { name: "DeananAwsen_79", id: 10, filepath: "../static/images/artworks/DeananAwsen_79.jpeg", value: 2},
    { name: "EvelynDarkeyes_99", id: 11, filepath: "../static/images/artworks/EvelynDarkeyes_99.jpeg", value: 4},
    { name: "RelaxInWoods_129", id: 12, filepath: "../static/images/artworks/RelaxInWoods_129.jpeg", value: 7},
    { name: "FarmBoy_149", id: 13, filepath: "../static/images/artworks/FarmBoy_149.jpeg", value: 9},
    { name: "PaulineIngido_159", id: 14, filepath: "../static/images/artworks/PaulineIngido_159.jpeg", value: 10},
    { name: "AsYouWere_79", id: 15, filepath: "../static/images/artworks/AsYouWere_79.jpeg", value: 2},
    { name: "ListedEmotions_99", id: 16, filepath: "../static/images/artworks/ListedEmotions_99.jpeg", value: 4},
    { name: "StreamOfOne_129", id: 17, filepath: "../static/images/artworks/StreamOfOne_129.jpeg", value: 7},
    { name: "RulesOfDesign_149", id: 18, filepath: "../static/images/artworks/RulesOfDesign_149.jpeg", value: 9},
    { name: "BeyondMusic_159", id: 19, filepath: "../static/images/artworks/BeyondMusic_159.jpeg", value: 10},
    { name: "HearingWinds_129", id: 20, filepath: "../static/images/artworks/HearingWinds_129.jpeg", value: 7},
    { name: "Spa_149", id: 21, filepath: "../static/images/artworks/Spa_149.jpeg", value: 9},
    { name: "TheFullView_99", id: 22, filepath: "../static/images/artworks/TheFullView_99.jpeg", value: 4},
    { name: "JulyAugust_89", id: 23, filepath: "../static/images/artworks/JulyAugust_89.jpeg", value: 3},
    { name: "Nights_69", id: 24, filepath: "../static/images/artworks/Nights_69.jpeg", value: 1},
    { name: "ViennaIsWaiting_69", id: 25, filepath: "../static/images/artworks/ViennaIsWaiting_69.jpeg", value: 1},
    { name: "Lascaux_129", id: 26, filepath: "../static/images/artworks/Lascaux_129.jpeg", value: 7},
    { name: "ForcefulLiving_159", id: 27, filepath: "../static/images/artworks/ForcefulLiving_159.jpeg", value: 10},
    { name: "NirvanasGates_99", id: 28, filepath: "../static/images/artworks/NirvanasGates_99.jpeg", value: 4},
    { name: "BedOfBoats_79", id: 29, filepath: "../static/images/artworks/BedOfBoats_79.jpeg", value: 2},
    { name: "PointlessVisitor_149", id: 30, filepath: "../static/images/artworks/PointlessVisitor_149.jpeg", value: 9},
    { name: "Wrecks_99", id: 31, filepath: "../static/images/artworks/Wrecks_99.jpeg", value: 4},
    { name: "HidingTime_89", id: 32, filepath: "../static/images/artworks/HidingTime_89.jpeg", value: 3},
    { name: "DevelopmentalViews_129", id: 33, filepath: "../static/images/artworks/DevelopmentalViews_129.jpeg", value: 7},
    { name: "OneSidedConversations_149", id: 34, filepath: "../static/images/artworks/OneSidedConversations_149.jpeg", value: 9},
    { name: "BlowingIce_69", id: 35, filepath: "../static/images/artworks/BlowingIce_69.jpeg", value: 1},
    { name: "BrendaBooker_79", id: 36, filepath: "../static/images/artworks/BrendaBooker_79.jpeg", value: 2},
    { name: "CreepyCrawler_99", id: 37, filepath: "../static/images/artworks/CreepyCrawler_99.jpeg", value: 4},
    { name: "BleedingBoat_129", id: 38, filepath: "../static/images/artworks/BleedingBoat_129.jpeg", value: 7},
    { name: "CaveMasters_149", id: 39, filepath: "../static/images/artworks/CaveMasters_149.jpeg", value: 9},
    { name: "FloatingLust_149", id: 40, filepath: "../static/images/artworks/FloatingLust_149.jpeg", value: 9},
    { name: "Illuminate_79", id: 41, filepath: "../static/images/artworks/Illuminate_79.jpeg", value: 2},
    { name: "Tattoo_99", id: 42, filepath: "../static/images/artworks/Tattoo_99.jpeg", value: 4},
    { name: "SoFarUp_129", id: 43, filepath: "../static/images/artworks/SoFarUp_129.jpeg", value: 7},
    { name: "ItStillHurts_149", id: 44, filepath: "../static/images/artworks/ItStillHurts_149.jpeg", value: 9},
    { name: "FlowersWithJam_129", id: 45, filepath: "../static/images/artworks/FlowersWithJam_129.jpeg", value: 7},
    { name: "FloraOverflow_149", id: 46, filepath: "../static/images/artworks/FloraOverflow_149.jpeg", value: 9},
    { name: "BrainFlowers_99", id: 47, filepath: "../static/images/artworks/BrainFlowers_99.jpeg", value: 4},
    { name: "AirbrushedFlowers_79", id: 48, filepath: "../static/images/artworks/AirbrushedFlowers_79.jpeg", value: 2},
    { name: "OptimisticFlowers_159", id: 49, filepath: "../static/images/artworks/OptimisticFlowers_159.jpeg", value: 10}];

    let start = round * numImages;
    let end = start + numImages; 
    return all_arts.slice(start, end);
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
                name: "Me",
                avatar_filepath: "../static/images/avatar-self.png",
                condition: mycondition
            }, 
            player_info: [
                { 
                    id: 10, 
                    name: "Bart",
                    avatar_filepath: "../static/images/avatar1.png",
                    condition: default_condition
                }, 
                { 
                    id: 2,
                    name: "Ed", 
                    avatar_filepath: "../static/images/avatar2.png",
                    condition: default_condition
                },
                {
                    id: 30, 
                    name: "Claire", 
                    avatar_filepath: "../static/images/avatar3.png",
                    condition: default_condition
                },
                {
                    id: 4, 
                    name: "Ida", 
                    avatar_filepath: "../static/images/avatar4.png",
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

function rand_art(trial_index) { 
    let random_choice = Math.floor((Math.random() * numImages));
    let arts = jsPsych.data.get().filter({'trial_index':trial_index}).values()[0].order;
    return arts[random_choice];
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
    let trial_data = jsPsych.data.get().filter({'trial_index': trial_index}).values()[0];

    // in offline mode, fill with dummy values
    if(offlineMode) {  
        // update correct choice (random), overwrite dummy_choices placeholder
        trial_data.correct = rand_art(trial_index);

        trial_data.dummy_choices = new Array(numPlayers).fill({art: null, correct: null});
 
        copying_trial_index = trial_index - 2; 
        copying_trial_data = jsPsych.data.get().filter({'trial_index': copying_trial_index}).values()[0]

        // if first round (or first training round), no one is copying, so decide other players' choices and return 
        if(copying_trial_data.trial_type !== "html-button-response" || copying_trial_data.prompt !== "Which player would you like to copy?") { 
            // update dummy choices
            for (i = 0; i < numPlayers; i++) {
                let dummy_art = rand_art(trial_index);
                let dummy_correct = (trial_data.correct.id == dummy_art.id);

                trial_data.dummy_choices[i] = {art: dummy_art, correct: dummy_correct};
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
                let dummy_art = rand_art(trial_index);//eval(`img${(p % numImages) + 1}`);
                let dummy_correct = (trial_data.correct.id == dummy_art.id);

                trial_data.dummy_choices[p] = {art: dummy_art, correct: dummy_correct};
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
                if(trial_data.dummy_choices[next_pos].art != null) { 
                    trial_data.dummy_choices[p] = trial_data.dummy_choices[next_pos];
                }
                // if the person p is copying did copy (art is initialized to null) but they haven't been assigned a choice (art remains null), there's a loop - randomly assign a choice value
                else { 
                    // make random choice
                    let art_choice = rand_art(trial_index);
                    let iscor = (trial_data.correct.id == art_choice.id);

                    trial_data.dummy_choices[p] = {art: art_choice, correct: iscor};
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

// picks whether and who the player is copying
function rand_copy(pos) { 
    let rand_range = Math.random() * numPlayers; //+ 1); // including yourself
    let rand_choice = Math.floor(rand_range);
    console.log(rand_choice)
    console.log(rand_range)

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
        jsPsych.data.get().filter({'trial_index': prev_trial_index}).values()[0].dummy_choices = []; 

        for (i = 0; i < numPlayers; i++) { 
            // this uses the assumption that the hard-coded "placeholder" is sorted in order of the dummyChoices array

            jsPsych.data.get().filter({'trial_index': prev_trial_index}).values()[0].dummy_choices[i] = {copying: placeholder[i+1].copying, copying_id: placeholder[i+1].copying_id};
        }

        return placeholder;
    }
}