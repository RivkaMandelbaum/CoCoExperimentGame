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

 // display art and allow selection
 let artDisplaySelectionChoice = {
    type: "multi-image-button-response",
    stimulus: ["images"], //jsPsych.timelineVariable('img_array'),
    prompt: "Please select what you think is the <strong> highest-value </strong> artwork.",
    correct_choice: jsPsych.timelineVariable('correct_choice'),
    choices: function() {
        let ch = [];
        let len = jsPsych.timelineVariable('img_array', true).length;
        for (i = 1; i <= len; i++) { 
            //ch.push(i);
            ch.push(`<img src = ${jsPsych.timelineVariable('img_array', true)[i-1]}></img>`)
        }
        return ch;
    }, 
    response_ends_trial: true,
    trial_duration: trialDuration,
    data: {
        correct: jsPsych.timelineVariable('correct_choice'),
        dummy_choices: jsPsych.timelineVariable('dummy_choices')
    }
};

// waiting trial with after-finish functionality 
let artDisplaySelectionWait = { 
    type: "waiting", 
    prompt: "Please wait for other players.", 
    max_trial_duration: function() { return duration(offlineMode); },
    trial_function: function() {
        let trial_index = jsPsych.progress().current_trial_global - 1;
        
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
    stimulus: jsPsych.timelineVariable('img_array'), 
    prompt: "Continue to see what choice was made.", 
    choices: ["Continue"],
    data: { 
        correct: jsPsych.timelineVariable('correct_choice'),
        dummy_choices: jsPsych.timelineVariable('dummy_choices')
    },
}
let artDisplayCopyWait = { 
    type: "waiting", 
    prompt: "Please wait for other players.", 
    max_trial_duration: function() { return duration(offlineMode)},
    trial_function: function() {
        let trial_index = jsPsych.progress().current_trial_global - 1;

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

/* ---- display own results trial ---- */ 

let displaySelfResults = {
    type: "html-button-response",
    stimulus: function () { 
        let index_param = jsPsych.progress().current_trial_global - 2;
        return buildSelfResultsStimulus(index_param, bIsCopying, playerCopyingID);
    }, 
    choices: ["Continue"],
    response_ends_trial: true, 
    trial_duration: trialDuration
}

/* ---- choose whether to copy timeline ---- */ 

let chooseToCopyChoice = {
    type: "html-button-response",
    stimulus: function() { 
        let index_param = jsPsych.progress().current_trial_global - 3;
        return buildCopyStimulus(index_param);
    },
    prompt: "Which player would you like to copy?", 
    choices: function() { 
        let ch = ["None, I would like to make my own choice."];
        for (i = 0; i <numPlayers; i++) { 
            ch.push(`${dummyPlayers[i].name}`);
        }
        return ch; 
    },
    response_ends_trial: true, 
    trial_duration: trialDuration
}

let chooseToCopyWait = { 
    type: "waiting", 
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