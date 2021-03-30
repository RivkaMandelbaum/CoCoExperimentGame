/* ------------------------------------------------------------ */ 
/* trial definion for complicated trials:                       */     
/* ------------------------------------------------------------ */  
const trialDuration = (120 * 1000); // force end of decision after this time
const waitDuration = 10 * 1000; // show waiting screen when offline for this long

function duration(offlineMode) { 
    // finish this screen after waitDuration ms when offline
    // when online, wait for all players
    if (offlineMode) return waitDuration;
    else return null;
}

/* ---- consent timeline ---- */ 
let consentChoice = { 
    type: "html-button-response",
    stimulus: "PLACEHOLDER FOR CONSENT INFORMATION. <br> </br> By clicking on the button below, you consent to participate in the experiment.", 
    choices: ["Consent and continue to experiment"], 
    on_finish: function() {         
        console.log("finished consent form");
    }
}

// functionality to perform after players have all finished consent part
// plus waiting screen 
let consentWait = { 
    type: "waiting",
    prompt: "Please wait for other players.", 
    max_trial_duration: function() { return duration(offlineMode)},
    trial_function: function() { 
        /* -------- experiment setup steps -------- */ 
        // display initial amount of money 
        document.getElementById("money-amount").innerHTML = "Your total amount of money is: " + startAmount.toString();

        // if online, will return object with numPlayers, self id, and other ids as array 
        // if offline, will return dummy values of those 
        let initObject = getPlayerInfo(offlineMode); 
        numPlayers = initObject.players; 

        // define player 
        player = new createPlayer(initObject.self_id, initObject.self_name, initObject.self_avatar_filepath);

        // define dummy players 
        for(i = 0; i < numPlayers; i++) {
            let otherPlayerInfo = initObject.player_info[i];
            let otherPlayer = new createPlayer(otherPlayerInfo.id, otherPlayerInfo.name, otherPlayerInfo.avatar_filepath);
            dummyPlayers.push(otherPlayer);
            idLookup[otherPlayer.id] = i; 
        }

        // define dummy choices array for timeline variable default 
        for(i = 0; i < numPlayers; i++) {
            d_choices.push(i);
        }
    }, 
    function_ends_trial: true 
}

// combine the two parts of the consent trial into one timeline
let consentTrial = [consentChoice, consentWait]

/* ---- art selection ---- */ 
let intervalID = null; 

 // display art and allow selection
 let artDisplaySelectionChoice = {
    type: "multi-image-button-response",
    on_start: function() { 
        intervalID = startTimer(trialDuration / 1000);
        // if online, ** DEALS WITH ** artwork information. if offline, dummy
        getArtworks(offlineMode);
    },
    stimulus: null, 
    prompt: "Please select what you think is the <strong> highest-value </strong> artwork.",
    choices: function() {
        // create choices array to return and version with randomized position to act as dictionary
        let ch = [];
        let tv_img_array = jsPsych.timelineVariable('img_array', true);
        let len = tv_img_array.length;
        for(i = 0; i < len; i++) ch.push(i);
        let shuffled = jsPsych.randomization.shuffle(ch); 

        let order = [];

        // add images to the array in the order they will appear in
        for(i = 0; i < len; i++){
            pos = shuffled[i];

            ch[i] = `<img src = ${tv_img_array[pos].filepath}></img>`;
            order.push(tv_img_array[pos]);
        }

        // add the order that images appeared to the orderLookup object
        orderLookup[jsPsych.progress().current_trial_global] = order;

        return ch; 
    }, 
    response_ends_trial: true,
    trial_duration: trialDuration,
    data: {
        correct: jsPsych.timelineVariable('correct_choice'),
        dummy_choices: jsPsych.timelineVariable('dummy_choices'), 
        order: "This is a placeholder. It should be updated in the on_finish function."
    }, 
    on_finish: function() {
        // update order data to be correct
        let index = jsPsych.progress().current_trial_global;
        jsPsych.data.get().values()[index].order = orderLookup[index];

        // clear timer
        clearInterval(intervalID);
    }
};

// waiting trial with after-finish functionality 
let artDisplaySelectionWait = { 
    type: "waiting", 
    on_start: function() { 
        document.getElementById("countdown-timer").innerHTML = "";
    },
    prompt: "Please wait for other players.", 
    max_trial_duration: function() { return duration(offlineMode); },
    trial_function: function() {
        let trial_index = jsPsych.progress().current_trial_global - 1;

        // check if time ran out and update counter if it did
        if(getPlayerSelection(trial_index) === null) numTimeRanOut++;
        
        // update players' money:
        jsPsych.pauseExperiment(); 

        // send and collect responses and update timeline variables
        backendArtSelections(trial_index, offlineMode);

        // check self correctness and update money/display
        if(isPlayerCorrect(trial_index)) {
            player.money += rewardForCorrect;
            player.numCorrect++;
            document.getElementById("money-amount").innerHTML = "Your total amount of money is: " + player.money.toString();
        }
        console.log(`${player.name}: ${testPlayer(player)}`); 

        // update players (uses timeline variables within function) and log to console
        updateCorrect(trial_index);

        jsPsych.resumeExperiment();
    }, 
    function_ends_trial: true
}

// combine into timeline
let artDisplaySelection = [artDisplaySelectionChoice, artDisplaySelectionWait];

/* ---- art display while copying ---- */ 

// display art but do not allow selection (copy instead)
let artDisplayCopyChoice = { 
    type: "multi-image-button-response", 
    on_start: function() { 
        intervalID = startTimer(trialDuration / 1000);

        // if online, ** DEALS WITH ** artwork information. if offline, dummy
        getArtworks(offlineMode);
    },
    stimulus: function() { 
        // create array to return and version with randomized position to act as dictionary
            let st = [];
            let ord = [];
            let tv_img_array = jsPsych.timelineVariable('img_array', true);
            let len = tv_img_array.length;
            for(i = 0; i < len; i++) st.push(i);
            let shuffled = jsPsych.randomization.shuffle(st); 
    
            // add images to the array in the order they will appear in
            for(i = 0; i < len; i++){
                pos = shuffled[i];
    
                st[i] = tv_img_array[pos].filepath;
                ord.push(tv_img_array[pos]);
            }
    
            // add the order that images appeared to the orderLookup object
            orderLookup[jsPsych.progress().current_trial_global] = ord;
    
            return st; 
    }, 
    prompt: "Continue to see what choice was made.", 
    choices: ["Continue"],
    data: { 
        correct: jsPsych.timelineVariable('correct_choice'),
        dummy_choices: jsPsych.timelineVariable('dummy_choices'),
        order: "This is a placeholder. It should be updated in the on_finish function."
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
    max_trial_duration: function() { return duration(offlineMode)},
    trial_function: function() {
        let trial_index = jsPsych.progress().current_trial_global - 1;

        // check if time ran out and update counter if it did
        if(getPlayerSelection(trial_index) === null) numTimeRanOut++;

        // wait for other player's responses
        jsPsych.pauseExperiment(); 

        // get responses and update timeline variables to match
        backendArtSelections(trial_index, offlineMode);

        // using responses, update player stats
        // self:
        if(isDummyCorrect(playerCopyingID, trial_index)) {
            player.money += rewardForCorrect;
            player.numCorrect++;
            document.getElementById("money-amount").innerHTML = "Your total amount of money is: " + player.money.toString();
        }
        console.log(`${player.name}: ${testPlayer(player)}`); 

        // others: 
        updateCorrect(trial_index);

        jsPsych.resumeExperiment(); 
    }, 
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
        let s = buildCopyStimulus(index_param);

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
    max_trial_duration: function() { return duration(offlineMode)},
    trial_function: function() {
        jsPsych.pauseExperiment(); 

        // information related to previous choice
        let trial_index = jsPsych.progress().current_trial_global - 1;
        let buttonPressed = getPlayerSelection(trial_index);

        // update relevant variables
        bIsCopying = didPlayerCopy(buttonPressed); 
        if(bIsCopying) playerCopyingID = dummyPlayers[buttonPressed-1].id; // button labels are created by iteration thrugh dummyPlayers array in order

        // get others' choices and update players
        currInfo = backendPlayersCopying(offlineMode, bIsCopying, playerCopyingID, trial_index+1);
        updateCopying(currInfo); 

        jsPsych.resumeExperiment(); 

        numExecutions++;  // since this is last trial on timeline
    }, 
    function_ends_trial: true
}

let chooseToCopy = [chooseToCopyChoice, chooseToCopyWait]