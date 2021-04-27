/* ------------------------------------------------------------ */ 
/* Definitions of complicated trials for Artwork Selection      */
/* Experiment.                                                  */   
/* Author: Rivka Mandelbaum                                     */  
/* ------------------------------------------------------------ */

/* For trial duration paramaters: 
   Must be placed here so that trialdefs.js can access during creation. */ 
const trialDuration = (120 * 1000); // force end of decision after this time
const waitDuration = 10 * 1000; // when offline, and function_ends_trial is false in waiting trials, waiting trials end after this amount of time

function duration(offlineMode) { 
    // finish this screen after waitDuration ms when offline
    // when online, wait for all players
    if (offlineMode) return waitDuration;
    else return null;
}

/* ---- experiment setup timeline ---- */ 
let startChoice = { 
    type: "instructions",
    pages: ["INSTRUCTIONS PAGE PLACEHOLDER! <br> Please make your browser window as large as possible.<br>Press the right arrow key on your keyboard to continue to the experiment."], 
}

// functionality to perform after players have all joined
// plus waiting screen 
let startWait = { 
    type: "waiting",
    prompt: "Please wait for other players.", 
    trial_function: function() { 
        // display initial amount of money 
        document.getElementById("money-amount").innerHTML = "Your total amount of money is: " + startAmount.toString();

        // returns object with numPlayers, self id, and other ids as array 
        // if offline, will return dummy values of those 
        let initObject = getPlayerInfo(offlineMode); 
        numPlayers = initObject.players; 

        // define player 
        let self = initObject.self_info; 
        player = new createPlayer(self.id, self.name, self.avatar_filepath, self.condition);

        // define dummy players 
        for(i = 0; i < numPlayers; i++) {
            let other_info = initObject.player_info[i];
            let otherPlayer = new createPlayer(other_info.id, other_info.name, other_info.avatar_filepath, other_info.condition);

            dummyPlayers.push(otherPlayer);
            idLookup[otherPlayer.id] = i; 
        }
    }, 
    on_finish: function() { 
        // update participant condition data
        jsPsych.data.get().values()[jsPsych.progress().current_trial_global].participant_condition = player.condition; 
    }, 
    data: {
        participant_condition: "placeholder", // to be updated when player.condition is received from backend
    },
    max_trial_duration: function() { return duration(offlineMode)},
    function_ends_trial: true,  
}

let startTrial = [startChoice, startWait]

/* ---- art selection ---- */ 
let intervalID = null; // for timer functions

 // display art and allow player to choose highest-value image
 let artDisplaySelectionChoice = {
    type: "multi-image-button-response",
    on_start: function() { 
        intervalID = startTimer(trialDuration / 1000);
    },
    choices: function() {
        // return array of artworks in randomized positions to create buttons, and create dictionary of positions player saw in given trial
        let ch = [];
        let img_array = getArtworks(offlineMode);
        let len = img_array.length;

        for(i = 0; i < len; i++) ch.push(i);
        let shuffled = jsPsych.randomization.shuffle(ch); 

        let order = [];

        // add images to the array in the order they will appear in
        for(i = 0; i < len; i++){
            pos = shuffled[i];

            ch[i] = `<img src = ${img_array[pos].filepath}></img>`;
            order.push(img_array[pos]);
        }

        // add the order that images appeared to the orderLookup object
        orderLookup[jsPsych.progress().current_trial_global] = order;

        return ch; 
    }, 
    prompt: "Please select what you think is the <strong> highest-value </strong> artwork.",
    data: {
        correct: "Placeholder to be updated in waiting trial through backendArtSelections function",
        dummy_choices: "Placeholder to be updated in waiting trial through backendArtSelections function", 
        order: "Placeholder to be updated in the on_finish function."
    }, 
    on_finish: function() {
        // update order data to be correct
        let index = jsPsych.progress().current_trial_global;
        jsPsych.data.get().values()[index].order = orderLookup[index];

        // clear timer
        clearInterval(intervalID);
    }, 
    response_ends_trial: true,
    trial_duration: trialDuration,
};

// wait for other players' info and update local information
let artDisplaySelectionWait = { 
    type: "waiting", 
    on_start: function() { 
        document.getElementById("countdown-timer").innerHTML = "";
    },
    prompt: "Please wait for other players.", 
    trial_function: function() {
        let trial_index = jsPsych.progress().current_trial_global - 1;

        // check if time ran out and update counter if it did
        if(getPlayerSelection(trial_index) === null) numTimeRanOut++;
        
        // update players' money:
        jsPsych.pauseExperiment(); 

        // send and collect responses and update previous trial data
        backendArtSelections(trial_index, offlineMode);

        // check self correctness and update money/display
        if(isPlayerCorrect(trial_index)) {
            player.money += rewardForCorrect;
            player.numCorrect++;
            document.getElementById("money-amount").innerHTML = "Your total amount of money is: " + player.money.toString();
        }
        //console.log(`${player.name}: ${testPlayer(player)}`); 

        // update players (uses data from previous trial)
        updateCorrect(trial_index);

        jsPsych.resumeExperiment();
    },
    max_trial_duration: function() { return duration(offlineMode); },
    function_ends_trial: true
}

let artDisplaySelection = [artDisplaySelectionChoice, artDisplaySelectionWait];

/* ---- art display while copying ---- */ 

// display art without allowing player to select
let artDisplayCopyChoice = { 
    type: "multi-image-button-response", 
    on_start: function() { 
        intervalID = startTimer(trialDuration / 1000);
    },
    stimulus: function() { 
        // create array of images with randomized position and add positions to dictionary
            let st = [];
            let ord = [];
            let img_array = getArtworks(offlineMode);
            let len = img_array.length;

            for(i = 0; i < len; i++) st.push(i);
            let shuffled = jsPsych.randomization.shuffle(st); 
    
            // add images to the array in the order they will appear in
            for(i = 0; i < len; i++){
                pos = shuffled[i];
    
                st[i] = img_array[pos].filepath;
                ord.push(img_array[pos]);
            }
    
            // add the order that images appeared to the orderLookup object
            orderLookup[jsPsych.progress().current_trial_global] = ord;
    
            return st; 
    }, 
    render_on_canvas: false,
    prompt: "Click <strong> continue </strong> to see what choice was made.", 
    choices: ["Continue"],
    data: { 
        correct: "Placeholder to be updated in waiting trial through backendArtSelections function",
        dummy_choices: "Placeholder to be updated in waiting trial through backendArtSelections function",
        order: "Placeholder to be updated in the on_finish function."
    }, 
    on_finish: function() {
        // update order data to be correct
        let index = jsPsych.progress().current_trial_global;
        jsPsych.data.get().values()[index].order = orderLookup[index];

        // clear timer
        clearInterval(intervalID);
    },
    response_ends_trial: true,
    trial_duration: trialDuration
}
let artDisplayCopyWait = { 
    type: "waiting", 
    on_start: function() { 
        document.getElementById("countdown-timer").innerHTML = "";
    },
    prompt: "Please wait for other players.", 
    trial_function: function() {
        let trial_index = jsPsych.progress().current_trial_global - 1;

        // check if time ran out and update counter if it did
        if(getPlayerSelection(trial_index) === null) numTimeRanOut++;

        jsPsych.pauseExperiment(); 

        // get responses and update previous trial data to match
        backendArtSelections(trial_index, offlineMode);

        // using responses, update player stats
        // self:
        if(isDummyCorrect(playerState.player_copying_id, trial_index)) {
            player.money += rewardForCorrect;
            player.numCorrect++;
            document.getElementById("money-amount").innerHTML = "Your total amount of money is: " + player.money.toString();
        }
        //console.log(`${player.name}: ${testPlayer(player)}`); 

        // others: 
        updateCorrect(trial_index);

        jsPsych.resumeExperiment(); 
    }, 
    max_trial_duration: function() { return duration(offlineMode)},
    function_ends_trial: true
}

let artDisplayCopy = [artDisplayCopyChoice, artDisplayCopyWait]

/* ---- choose whether to copy timeline ---- */ 

let chooseToCopyChoice = {
    type: "html-button-response",
    on_start: function() { 
        intervalID = startTimer(trialDuration / 1000);
    },
    stimulus: function() { 
        let index_param = jsPsych.progress().current_trial_global - 2;
        let s = "";

        // build table (based on the different conditions)
        let tablefunc = conditionLookup[player.condition];
        if (typeof(tablefunc) === "function") { 
            s = tablefunc(index_param);
        }
        else { 
            console.warn("Inconsistent condition names! Please check getPlayerInfo, createPlayer, and chooseToCopyChoice stimulus.");
            s = "<p> ERROR IN EXPERIMENT. SORRY ABOUT THIS. CONTACT US. </p>"
        }
        

        // in all but last round, add explanation about being allowed to copy
        if (numExecutions < numDecisions) {
            return s + (`In the next round, you may either choose the highest-value artwork on your own or pay another player $${payToCopy} to copy their choice.`);
        }
        else { 
            return s;
        }

    },
    prompt: function() { 
        if (numExecutions < numDecisions) {
            return "Which player would you like to copy?";
        }
        else { 
            return;
        }
    }, 
    choices: function() { 
        if (numExecutions < numDecisions) { 
            let ch = ["None, I would like to make my own choice."];
            for (i = 0; i <numPlayers; i++) { 
                ch.push(`${dummyPlayers[i].name}`);
            }
            return ch; 
        }
        else {
            return ["Continue to end of experiment."];
        }
        
    },
    on_finish: function() {
        clearInterval(intervalID);
    },
    response_ends_trial: true, 
    trial_duration: trialDuration
}

let chooseToCopyWait = { 
    type: "waiting",
    on_start: function() { 
        document.getElementById("countdown-timer").innerHTML = "";
    }, 
    prompt: "Please wait for other players.", 
    trial_function: function() {
        jsPsych.pauseExperiment(); 

        // information related to previous choice
        let curr_trial_index = jsPsych.progress().current_trial_global;
        let choice = getPlayerSelection(curr_trial_index - 1);

        // update relevant variables
        playerState.is_copying = didPlayerCopy(choice); 
        if(playerState.is_copying) playerState.player_copying_id = dummyPlayers[choice-1].id; // button labels are created by iteration thrugh dummyPlayers array in order

        // get others' choices and update players
        currInfo = backendPlayersCopying(offlineMode, playerState, curr_trial_index);
        updateCopying(currInfo); 

        jsPsych.resumeExperiment(); 

        numExecutions++;  // since this is last trial on timeline
    }, 
    max_trial_duration: function() { return duration(offlineMode); },
    function_ends_trial: true
}

let chooseToCopy = [chooseToCopyChoice, chooseToCopyWait]