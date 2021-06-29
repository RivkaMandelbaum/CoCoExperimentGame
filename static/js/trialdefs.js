/* ------------------------------------------------------------ */ 
/* Definitions of complicated trials for Artwork Selection      */
/* Experiment.                                                  */   
/* Author: Rivka Mandelbaum                                     */  
/* ------------------------------------------------------------ */

/* For trial duration paramaters: 
   Must be placed here so that trialdefs.js can access during creation. */ 
const TIMER_DURATION = (1/60); // seconds that timer counts down
const TRIAL_DURATION = (TIMER_DURATION + 1) * 1000; // ms, force end of decision after this time (+1 to allow timer to reach 0)
const waitDuration = 10 * 1000; // when offline, and function_ends_trial is false in waiting trials, waiting trials end after this amount of time
let intervalID = null; // for timer functions

function duration(offlineMode) { 
    // finish this screen after waitDuration ms when offline
    // when online, wait for all players
    if (offlineMode) return waitDuration;
    else return null;
}

/* wraps each trial with a conditional function based on whether the player is valid (hasn't failed attention check twice or ran out of time twice) */
function createNodeWithTrial(trial_definition) { 
    const NODE_TEMPLATE = {
        timeline: null,
        conditional_function: function() { return isValidPlayer(); },
    };

    let customNode = Object.assign({}, NODE_TEMPLATE);
    customNode.timeline = [trial_definition];
    return customNode;
}

/* --- welcome --- */ 
	/* define welcome message as a trial */
	let welcome = {
		type: "html-keyboard-response",
		stimulus: function() { 
            return `<h1>Now let's do it for real!</h1><p>Good job on the practice rounds!</p><p>We're going to reset each player's money and start the real game.</p><p>You will begin with $${START_MONEY}, as will other players.</p><p>Press any key to begin.</p>`
        },
		on_start: function() { 
            intervalID = startTimer(TIMER_DURATION); 

			player.resetPlayerStats();
			console.log("reset player stats")
			showSidebarInfo();

			for(let i = 0; i < numPlayers; i++) { 
				dummyPlayers[i].resetPlayerStats();
			}

			playerState.is_copying = false;
			playerState.player_copying_id = -1; 
			numExecutions = 0; 		
        },
        on_finish: function() { 
            clearInterval(intervalID);
        }
    }; 
    
    let welcome_node = createNodeWithTrial(welcome);

/* ---- art selection ---- */ 

 // display art and allow player to choose highest-value image
 let artDisplaySelectionChoice = {
    type: "multi-image-button-response",
    on_start: function() { 
        intervalID = startTimer(TIMER_DURATION);
    },
    choices: function() {
        // return array of artworks in randomized positions to create buttons, and create dictionary of positions player saw in given trial
        let ch = [];
        let img_array = getArtworks(offlineMode, numExecutions);
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
        dummy_choices: "Placeholder to be updated in waiting trial through backendArtSelections function. Array of Artwork objects.", 
        order: "Placeholder to be updated in the on_finish function."
    }, 
    on_finish: function() {
        // update order data to be correct
        let index = jsPsych.progress().current_trial_global;
        getDataAtIndex(index).order = orderLookup[index];

        // clear timer
        clearInterval(intervalID);
    }, 
    response_ends_trial: true,
    trial_duration: (TRIAL_DURATION),
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
        
        // update players' money:
        jsPsych.pauseExperiment(); 

        // send and collect responses and update previous trial data
        backendArtSelections(trial_index, offlineMode);

        // update self money and update display to match
        let reward = getPlayerReward(trial_index);
        player.money += reward;
        player.reward += reward;
        showSidebarInfo();

        // update players (uses data from previous trial)
        for (i = 0; i < numPlayers; i++) { 
            let reward = getDummyReward(dummyPlayers[i].id, trial_index);
            dummyPlayers[i].money += reward;
            dummyPlayers[i].reward += reward;
        }
    
        jsPsych.resumeExperiment();
    },
    max_trial_duration: function() { return duration(offlineMode); },
    function_ends_trial: true
}

let artDisplaySelection = [createNodeWithTrial(artDisplaySelectionChoice), createNodeWithTrial(artDisplaySelectionWait)];

/* ---- art display while copying ---- */ 

// display art without allowing player to select
let artDisplayCopyChoice = { 
    type: "multi-image-button-response", 
    on_start: function() { 
        intervalID = startTimer(TIMER_DURATION);
    },
    stimulus: function() { 
        // create array of images with randomized position and add positions to dictionary
            let st = [];
            let ord = [];
            let img_array = getArtworks(offlineMode, numExecutions);
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
    // stimulus_html: "height: 30vh; width: 30vh",
    stimulus_height: 30,//function() { return 100/NUM_IMAGES; },
    stimulus_width: 30,//function() { return 100/NUM_IMAGES; },
    stimulus_height_units: "vh",
    stimulus_width_units: "vh",
    render_on_canvas: false,
    preamble: function() { 
        if (playerState.is_copying) { 
            let pos = idLookup[playerState.player_copying_id];
            let name = dummyPlayers[pos].name;
            return `<p id='copying-no-choice-explanation'>Because you're copying <strong>${name}</strong>, you can't choose an artwork in this round. Here are the artworks that ${name} is choosing from.</p>`   
        }
        else {
            console.warn("Art display copy trial reached, but playerState.is_copying is false!");
        }
    },
    prompt: "<p id='press-continue-copy-screen'.>Press <strong> continue </strong> to see the results.</p>", 
    choices: ["Continue"],
    data: { 
        dummy_choices: "Placeholder to be updated in waiting trial through backendArtSelections function. Array of Artwork objects.",
        order: "Placeholder to be updated in the on_finish function."
    }, 
    on_finish: function() {
        // update order data to be correct
        let index = jsPsych.progress().current_trial_global;
        getDataAtIndex(index).order = orderLookup[index];


        // clear timer
        clearInterval(intervalID);
    },
    response_ends_trial: true,
    trial_duration: TRIAL_DURATION
}
let artDisplayCopyWait = { 
    type: "waiting", 
    on_start: function() { 
        document.getElementById("countdown-timer").innerHTML = "";
    },
    prompt: "Please wait for other players.", 
    trial_function: function() {
        let trial_index = jsPsych.progress().current_trial_global - 1;

        jsPsych.pauseExperiment(); 

        // get responses and update previous trial data to match
        backendArtSelections(trial_index, offlineMode);

        // using responses, update player stats
        // self:
        let reward = getDummyReward(playerState.player_copying_id, trial_index);
        player.money += reward;
        player.reward += reward;
        showSidebarInfo();

        // others: 
        for (i = 0; i < numPlayers; i++) { 
            let reward = getDummyReward(dummyPlayers[i].id, trial_index);
            dummyPlayers[i].money += reward;
            dummyPlayers[i].reward += reward;
        }

        jsPsych.resumeExperiment(); 
    }, 
    max_trial_duration: function() { return duration(offlineMode)},
    function_ends_trial: true
}

let artDisplayCopy = [createNodeWithTrial(artDisplayCopyChoice), createNodeWithTrial(artDisplayCopyWait)];

/* ---- choose whether to copy timeline ---- */ 

let chooseToCopyChoice = {
    type: "html-button-response",
    on_start: function() { 
        intervalID = startTimer(TIMER_DURATION);
    },
    stimulus: function() { 
        let s = "";

        // build table (based on the different conditions)
        let tablefunc = conditionLookup[player.condition];
        if (typeof(tablefunc) === "function") { 
            s = tablefunc();
        }
        else { 
            console.warn("Inconsistent condition names! Please check getPlayerInfo, Player constructor, and chooseToCopyChoice stimulus.");
            s = "<p> ERROR IN EXPERIMENT. SORRY ABOUT THIS. CONTACT US. </p>"
        }
        

        // in all but last round, add explanation about being allowed to copy
        if (numExecutions < NUM_DECISIONS) {
            return s + (`<div id='next-round-instructions'>In the next round, you may either choose the highest-value artwork on your own or pay another player $${COPY_FEE} to copy their choice.</div></div>`);
        }
        else { 
            return s;
        }

    },
    // prompt: function() { 
    //     if (numExecutions < NUM_DECISIONS) {
    //         return "<div class='prompt'>Which player would you like to copy?</div>";
    //     }
    //     else { 
    //         return;
    //     }
    // }, 
    choices: function() { 
        if (numExecutions < NUM_DECISIONS) { 
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
    data: { 
        dummy_choices: "Placeholder to be updated in waiting trial through backendPlayersCopying function",
        player_money: function() { return player.money },
        player_reward: function() { return player.reward },
        dummy_money: function() { return dummyPlayers.map(p => p.money) },
        dummy_reward: function() { return dummyPlayers.map(p => p.reward) }
    }, 
    on_finish: function() {
        clearInterval(intervalID);
    },
    response_ends_trial: true, 
    trial_duration: TRIAL_DURATION
}

let chooseToCopyChoice_node = createNodeWithTrial(chooseToCopyChoice);

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
        let button = getPlayerSelection(curr_trial_index - 1);

        // update relevant variables
        playerState.is_copying = didPlayerCopy(button); 
        if(playerState.is_copying) playerState.player_copying_id = dummyPlayers[button-1].id; // button labels are created by iteration thrugh dummyPlayers array in order

        // get others' choices and update players
        currInfo = backendPlayersCopying(offlineMode, playerState, curr_trial_index);
        updateCopying(currInfo); 

        jsPsych.resumeExperiment(); 

        numExecutions++;  // since this is last trial on timeline
    }, 
    max_trial_duration: function() { return duration(offlineMode); },
    function_ends_trial: true
}

let chooseToCopyWait_node = createNodeWithTrial(chooseToCopyWait);