/* ------------------------------------------------------------ */ 
/* Definitions of complicated trials for Artwork Selection      */
/* Experiment.                                                  */   
/* Author: Rivka Mandelbaum                                     */  
/* ------------------------------------------------------------ */

/* For trial duration paramaters: 
   Must be placed here so that trialdefs.js can access during creation. */ 
const TIMER_DURATION = 1; // seconds that timer counts down
const TRIAL_DURATION = (TIMER_DURATION + 1) * 1000; // ms, force end of decision after this time (+1 to allow timer to reach 0)
const waitDuration = 10 * 1000; // when offline, and function_ends_trial is false in waiting trials, waiting trials end after this amount of time
let intervalID = null; // for timer functions

function duration(offlineMode) { 
    // finish this screen after waitDuration ms when offline
    // when online, wait for all players
    if (offlineMode) return waitDuration;
    else return null;
}

/* wraps each trial with a conditional function based on whether the player is valid */
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

            for (let i = 0; i < numPlayers; i++) { 
                players[i].resetPlayerStats(); 
            }
            showSidebarInfo();
            console.log("Reset player stats");

            numExecutions = 0; 		
        },
        on_finish: function() { 
            clearInterval(intervalID);
        },
        response_ends_trial: true,
        trial_duration: TRIAL_DURATION
    }; 
    
    let welcome_node = createNodeWithTrial(welcome);

/* ---- art selection ---- */ 

 // display art and allow player to choose highest-value image
 let art_choice = {
    type: "multi-image-button-response",
    on_start: function() { 
        intervalID = startTimer(TIMER_DURATION);
   },
   choices: () => artArray(true, jsPsych.progress().current_trial_global),
    /*preamble:*/
    prompt: "Please select what you think is the <strong> highest-value </strong> artwork.",
    data: {
        art_choices: "Placeholder to be updated in waiting trial through backendArtSelections function. Array of Artwork objects.", 
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
let art_choice_wait = { 
    type: "waiting", 
    on_start: function() { 
        document.getElementById("countdown-timer").innerHTML = "";
    },
    prompt: "Please wait for other players.", 
    trial_function: async function() {
        let trial_index = jsPsych.progress().current_trial_global - 1;
        let prev_trial_data = getDataAtIndex(trial_index);
        
        // update self art choice
        if (prev_trial_data.button_pressed === null) {  // ran out of time 
            self.art_choice = rand_art(trial_index);
        }
        else { // made a choice
            self.art_choice = prev_trial_data.order[prev_trial_data.button_pressed];
        }
        
        // update players' money:
        jsPsych.pauseExperiment(); 

        // send and collect responses and update previous trial data
        await backendArtSelections(trial_index, offlineMode);
        // players.map(e => {
        //     console.log(`id ${e.id} -- ${e.art_choice.value}`);
        // })

        // update player money and reward
        for (let i = 0; i < numPlayers; i++) { 
            let reward = players[i].art_choice.value;
            players[i].money += reward;
            players[i].reward += reward;
            players[i].reward_earned = reward;
            players[i].money_earned = reward;
        }
        showSidebarInfo();
    
        jsPsych.resumeExperiment();
    },
    max_trial_duration: function() { return duration(offlineMode); },
    function_ends_trial: true
}

let art_choice_wrap = [createNodeWithTrial(art_choice), createNodeWithTrial(art_choice_wait)];

/* ---- art display while copying ---- */ 

// display art without allowing player to select
let art_display = { 
    type: "multi-image-button-response", 
    on_start: function() { 
        intervalID = startTimer(TIMER_DURATION);
    },
    stimulus: () => artArray(false, jsPsych.progress().current_trial_global),
    // stimulus_html: "height: 30vh; width: 30vh",
    stimulus_height: 25,//function() { return 100/NUM_IMAGES; },
    stimulus_width: 25,//function() { return 100/NUM_IMAGES; },
    stimulus_height_units: "vh",
    stimulus_width_units: "vh",
    render_on_canvas: false,
    preamble: function() { 
        if (self.is_copying) { 
            let pos = idLookup[self.copying_id];
            let name = players[pos].name;
            return `<p id='copying-no-choice-explanation'>Because you're copying <strong>${name}</strong>, you can't choose an artwork in this round. Here are the artworks that ${name} is choosing from.</p>`   
        }
        else {
            console.warn("Art display copy trial reached, but playerState.is_copying is false!");
        }
    },
    prompt: "<p id='press-continue-copy-screen'.>Press <strong> continue </strong> to see the results.</p>", 
    choices: ["Continue"],
    data: { 
        art_choices: "Placeholder to be updated in waiting trial through backendArtSelections function. Array of Artwork objects.",
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
let art_display_wait = { 
    type: "waiting", 
    on_start: function() { 
        document.getElementById("countdown-timer").innerHTML = "";
    },
    prompt: "Please wait for other players.", 
    trial_function: async function() {
        let trial_index = jsPsych.progress().current_trial_global - 1;

        jsPsych.pauseExperiment(); 

        // get responses and update previous trial data to match
        backendArtSelections(trial_index, offlineMode);
        players.map(e => {
            console.log(`id ${e.id} -- ${e.art_choice.value}`);
        })

        // update players' money and reward
        for (let i = 0; i < numPlayers; i++) { 
            let reward = players[i].art_choice.value;
            players[i].money += reward;
            players[i].reward += reward;
            players[i].reward_earned = reward;
            players[i].money_earned = reward;
        }
        showSidebarInfo();

        jsPsych.resumeExperiment(); 
    }, 
    max_trial_duration: function() { return duration(offlineMode)},
    function_ends_trial: true
}

let art_display_wrap = [createNodeWithTrial(art_display), createNodeWithTrial(art_display_wait)];

/* ---- choose whether to copy timeline ---- */ 

let results_display = {
    type: "html-button-response",
    on_start: function() { 
        intervalID = startTimer(TIMER_DURATION);
        /* console.log('artwork values this round: ')
        let data = getDataAtIndex(jsPsych.progress().current_trial_global - 2).order;
        data.map(a => {console.log(a.value)});
        players.map(p => console.log(`${p.name} chose ${p.art_choice.id} = value ${p.art_choice.value}`)); */
    },
    stimulus: function() { 
        let s = "";

        // build table (based on the different conditions)
        let tablefunc = CONDITION_LOOKUP[self.condition];
        if (typeof(tablefunc) === "function") { 
            s = tablefunc();
        }
        else { 
            console.warn("Inconsistent condition names! Please check getPlayerInfo, Player constructor, and results_display stimulus.");
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
            for (i = 0; i < numOtherPlayers; i++) { 
                ch.push(`${players[i].name}`);
            }
            return ch; 
        }
        else {
            return ["Continue to end of experiment."];
        }
        
    },
    data: { 
        data: {
            copy_choices: "Placeholder", 
            players_money: function() { return players.map(p => p.money)},
            players_reward: function() { return players.map(p => p.reward)}
        },
    }, 
    on_finish: function() {
        clearInterval(intervalID);
    },
    response_ends_trial: true, 
    trial_duration: TRIAL_DURATION
}

let results_display_node = createNodeWithTrial(results_display);

let results_display_wait = { 
    type: "waiting",
    on_start: function() { 
        document.getElementById("countdown-timer").innerHTML = "";
    }, 
    prompt: "Please wait for other players.", 
    trial_function: async function() {
        jsPsych.pauseExperiment(); 

        // information related to previous choice
        let curr_trial_index = jsPsych.progress().current_trial_global;
        let button = getDataAtIndex(curr_trial_index - 1).button_pressed;

        self.is_copying = didPlayerCopy(button);
        self.copying_id = (self.is_copying) ? players[button-1].id : null;

        // send own choice and get others' choices 
        copyingInfo = await backendPlayersCopying(offlineMode, curr_trial_index);
        // console.log("Copying info: ", copyingInfo);

        // update player stats based on copy information
        for (let i = 0; i < numPlayers; i++) {
            currInfo = copyingInfo[i];  
            players[i].numWasCopied += currInfo.num_was_copied;
            players[i].money += currInfo.delta_money; 
            players[i].money_earned += currInfo.delta_money; 
    
            if (currInfo.copying) {
                players[i].numCopyingOther++;
                players[i].is_copying = true;
                players[i].copying_id = currInfo.copying_id;
            }
            else { // technically not needed for self but simpler to just overwrite again
                players[i].is_copying = false;
                players[i].copying_id = null;
            }
        }
        jsPsych.resumeExperiment(); 

        numExecutions++;  // since this is last trial on timeline
    }, 
    max_trial_duration: function() { return duration(offlineMode); },
    function_ends_trial: true,
}

let results_display_wait_node = createNodeWithTrial(results_display_wait);