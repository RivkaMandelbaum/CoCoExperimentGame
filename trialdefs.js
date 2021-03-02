/* ------------------------------------------------------------ */ 
/* trial definion for complicated trials:                       */     
/* ------------------------------------------------------------ */  
const trialDuration = (60 * 1000); // force end of decision after this time
const waitDuration = 500; // show waiting screen when offline for this long

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
    type: "html-keyboard-response", 
    stimulus: "Please wait for other players.", 
    choices: jsPsych.NO_KEYS,
    trial_duration: function () { 
        // finish this screen after waitDuration ms when offline
        // when online, wait for all players
        if (offlineMode) return waitDuration;
        else return null;
    },
    on_finish: function() {
        /* -------- experiment setup steps -------- */ 
        // display initial amount of money 
        document.getElementById("money-amount").innerHTML = "Your total amount of money is: " + startAmount.toString();

        // if online, will return object with numPlayers, self id, and other ids as array 
        // if offline, will return dummy values of those 
        let initObject = getPlayerInfo(); 
        numPlayers = initObject.players; 

        // define player 
        player = new createPlayer(initObject.self_id);

        // define dummy players 
        for(i = 0; i < numPlayers; i++) {
            let otherPlayer = new createPlayer(initObject.player_ids[i]);
            dummyPlayers.push(otherPlayer);
        }

        // define dummy choices array for timeline variable default 
        for(i = 0; i < numPlayers; i++) {
            d_choices.push(i);
        }
    }
}

// combine the two parts of the consent trial into one timeline
let consentTrial = [consentChoice, consentWait]

/* ---- art selection ---- */ 

 // display art and allow selection
 let artDisplaySelectionChoice = {
    type: "multi-image-button-response",
    stimulus: jsPsych.timelineVariable('img_array'),
    prompt: "Please select what you think is the <strong> highest-value </strong> artwork.",
    correct_choice: jsPsych.timelineVariable('correct_choice'),
    choices: function() {
        let ch = [];
        let len = jsPsych.timelineVariable('img_array', true).length;
        for (i = 1; i <= len; i++) { 
            ch.push(i);
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
    type: "html-keyboard-response", 
    stimulus: "Please wait for other players.", 
    choices: jsPsych.NO_KEYS,
    trial_duration: function() {
        // finish this screen after waitDuration ms when offline
        // when online, wait for all players
        if (offlineMode) return waitDuration;
        else return null;
    },
    on_finish: function() {
        let trial_index = jsPsych.progress().current_trial_global - 1;

        // check player correctness and update money/display
        if(isPlayerCorrect(trial_index)) {
            player.money += rewardForCorrect;
            player.numCorrect++;
            document.getElementById("money-amount").innerHTML = "Your total amount of money is: " + player.money.toString();
        }
        console.log(`self (id ${player.id}): ${testPlayer(player)}`); 
        
        // update other players' money:
        jsPsych.pauseExperiment(); 

        // collect responses and update timeline variables
        getPlayersChoices(trial_index, offlineMode);

        // update players (uses timeline variables within function) and log to console
        updatePlayerStats(trial_index);

        jsPsych.resumeExperiment();
    }
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
    type: "html-keyboard-response", 
    stimulus: "Please wait for other players.", 
    choices: jsPsych.NO_KEYS,
    trial_duration: function() {
        // finish this screen after waitDuration ms when offline
        // when online, wait for all players
        if (offlineMode) return waitDuration;
        else return null;
    },
    on_finish: function() {
        let trial_index = jsPsych.progress().current_trial_global - 1;

        // wait for other player's responses
        jsPsych.pauseExperiment(); 

        // get responses and update timeline variables to match
        getPlayersChoices(trial_index, offlineMode);

        // using responses, update player stats
        // self:
        if(isDummyCorrect(iPlayerCopying-1, trial_index)) {
            player.money += rewardForCorrect;
            player.numCorrect++;
            document.getElementById("money-amount").innerHTML = "Your total amount of money is: " + player.money.toString();
        }
        console.log(`self (id ${player.id}): ${testPlayer(player)}`); 

        // others: 
        updatePlayerStats(trial_index);

        jsPsych.resumeExperiment(); 
    }
}

let artDisplayCopy = [artDisplayCopyChoice, artDisplayCopyWait]

/* ---- display own results trial ---- */ 

let displaySelfResults = {
    type: "html-button-response",
    stimulus: function () { 
        let index_param = jsPsych.progress().current_trial_global - 2;
        return buildSelfResultsStimulus(index_param, bIsCopying, iPlayerCopying);
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
        for (i = 1; i <= numPlayers; i++) { 
            ch.push(`Player ${i}`);
        }
        return ch; 
    },
    response_ends_trial: true, 
    trial_duration: trialDuration
}

let chooseToCopyWait = { 
    type: "html-keyboard-response", 
    stimulus: "Please wait for other players.", 
    choices: jsPsych.NO_KEYS,
    trial_duration: function () { 
        // finish this screen after waitDuration ms when offline
        // when online, wait for all players
        if (offlineMode) return waitDuration;
        else return null;
    },
    on_finish: function() {
        jsPsych.pauseExperiment(); 

        // update variables 
        numExecutions++; 

        let buttonPressed = getPlayerSelection(jsPsych.progress().current_trial_global - 1);
        let playerCopyingIndex = buttonPressed-1; 

        if (buttonPressed === null) alert("Your time ran out! Moving to next round.");

        // if copying a player 
        if(buttonPressed > 0 && buttonPressed <= numPlayers && player.money >= payToCopy) { 
            bIsCopying = true;
            iPlayerCopying = buttonPressed; 
        }
        // if chose not to copy or time ran out
        else if(buttonPressed === 0 || buttonPressed === null) bIsCopying = false; 
        // if attempted to copy but doesn't have enough money, warn and reset choice to be not copying
        else { 
            alert("You do not have enough money to copy.");
            jsPsych.data.get().filter({'trial_index': jsPsych.progress().current_trial_global - 1}).select('button_pressed').values[0] = 0; 
            bIsCopying = false; 
        }

        // send and receive information if online
        if(!offlineMode) { 
            // PLACEHOLDER FOR SENDING AND RECEIVING ACTUAL INFO
            placeholderForResults = [{copy: true, who: 3}, {copy: false, who: 0}, {copy: false, who: 0}, {copy: false, who: 0}];
        }

        // update self and player who you're copying if relevant
        if(bIsCopying){
            player.money -= payToCopy;
            document.getElementById("money-amount").innerHTML = "Your total amount of money is: " + player.money.toString();
            player.timesCopying++; 

            // and adjust the money of the player being copied
            dummyPlayers[playerCopyingIndex].money += payToCopy;
            dummyPlayers[playerCopyingIndex].numCopied++;
            console.log(`player ${buttonPressed} (id ${dummyPlayers[playerCopyingIndex].id}) ${testPlayer(dummyPlayers[playerCopyingIndex])}`);
        }
        

        // if online: update other players based on their info
        if(!offlineMode) { 
            for(i = 0; i < numPlayers; i++) { 
                currInfo = placeholderForResults[i];
                if (currInfo.copy) { 
                    // update player copying
                    dummyPlayers[i].money -= payToCopy;
                    dummyPlayers[i].timesCopying++; 

                    // update player being copied
                    dummyPlayers[currInfo.who].money += payToCopy;
                    dummyPlayers[currInfo.who].numCopied ++;

                    console.log(`player ${i+1} copied player ${currInfo.who+1}`);
                }
            }
        }

        jsPsych.resumeExperiment(); 
    }
}

let chooseToCopy = [chooseToCopyChoice, chooseToCopyWait]