/* ------------------------------------------------------------ */ 
/* trial definion for complicated trials:                       */     
/* ------------------------------------------------------------ */  
 
 // display art and allow selection
 let artDisplaySelection = {
    type: "multi-image-button-response",
    stimulus: jsPsych.timelineVariable('img_array'),
    prompt: "Please select what you think is the <strong> highest-value </strong> artwork.",
    choices: [1, 2, 3, 4, 5], 
    correct_choice: jsPsych.timelineVariable('correct_choice'),
    data: {
        correct: jsPsych.timelineVariable('correct_choice'),
        dummy_choices: jsPsych.timelineVariable('dummy_choices')
    }, 
    on_finish: function(data) { 
        let trial_index = jsPsych.progress().current_trial_global;

        // check player correctness and update money/display
        if(isPlayerCorrect(trial_index)) {
            player.money += rewardForCorrect;
            player.numCorrect++;
            document.getElementById("money-amount").innerHTML = "Your total amount of money is: " + player.money.toString();
        }
        console.log("self " + testPlayer(player)); 
        
        // update other players' money:
        jsPsych.pauseExperiment(); 

        // collect responses and update timeline variables
        getPlayersChoices(trial_index, offlineMode);

        // update players (uses timeline variables within function) and log to console
        updatePlayerStats(trial_index);

        jsPsych.resumeExperiment();

    }
};

// display art but do not allow selection (copy instead)
let artDisplayCopy = { 
    type: "multi-image-button-response", 
    stimulus: jsPsych.timelineVariable('img_array'), 
    prompt: "Continue to see what choice was made.", 
    choices: ["Continue"],
    data: { 
        correct: jsPsych.timelineVariable('correct_choice'),
        dummy_choices: jsPsych.timelineVariable('dummy_choices')
    },
    on_finish: function(data) { 
        let trial_index = jsPsych.progress().current_trial_global;

        // wait for other player's responses
        jsPsych.pauseExperiment(); 

        // get responses and update timeline variables to match
        getPlayersChoices(trial_index, offlineMode);

        // using responses, update player stats
        if(isDummyCorrect(iPlayerCopying-1)) {
            player.money += rewardForCorrect;
            player.numCorrect++;
            document.getElementById("money-amount").innerHTML = "Your total amount of money is: " + player.money.toString();
        }
        console.log("self " + testPlayer(player)); 

        updatePlayerStats(trial_index);

        jsPsych.resumeExperiment(); 
    }
}

let displaySelfResults = {
    type: "html-button-response",
    stimulus: function () { 
        let response = "";
        let trial_index = jsPsych.progress().current_trial_global - 1;
        if(!bIsCopying) {
            let response = "Your choice was button number " + (getPlayerSelection(trial_index)+1) + ". \n"; 

            if (isPlayerCorrect(trial_index)) {
                return response + `Your answer is correct. You earned $${rewardForCorrect}.`; 
            }
            else {
                return response + "Your answer is incorrect. The correct value was: " + (getCorrectArtwork(trial_index)+1) + "."; 
            }
        }
        else { 
            response = `You chose to copy player ${iPlayerCopying}. Player ${iPlayerCopying} chose artwork ${getDummySelection(iPlayerCopying-1) + 1}. <br> </br>`;

            if(isDummyCorrect(iPlayerCopying-1)) {
                return response + `Player ${iPlayerCopying} was <strong> correct</strong>. You earned $${rewardForCorrect}.`;
            }
            else {
                return response + `Player ${iPlayerCopying} was <strong> incorrect</strong>. The correct value was ${getCorrectArtwork(trial_index) + 1}.`
            }
        }
    }, 
    choices: ["Continue"],
}

let chooseToCopy = {
    type: "html-button-response",
    stimulus: function() { 
        // builds a string detailing player's responses
        s = "Here are the other player's results. <br> </br>"; 
        for(i = 0; i < numPlayers; i++) {
        if(isDummyCorrect(i)) { 
            d_correct = "<strong> correctly </strong>"; 
            }
        else {
            d_correct = "<strong> incorrectly </strong>";
        }

        s = s.concat(`Player ${i+1} ${d_correct} chose artwork ${getDummySelection(i) + 1}. Player ${i+1} now has $${dummyPlayers[i].money}. <br> </br>`);
        }

        // adds explanation of choice
        s = s.concat(`You may either choose the highest-value artwork on your own or pay another player $${payToCopy} to copy their choice. <br> </br> <br> </br>`);

        return s; 
    },
    prompt: "Which player would you like to copy?", 
    choices: ["None, I would like to make my own choice.", "Player 1", "Player 2", "Player 3", "Player 4"],
    on_finish: function(data) {
        // update number of executions
        numExecutions+= 1; 

        // send data and wait for other players
        jsPsych.pauseExperiment(); 
        
        if(offlineMode){ 
            let buttonPressed = data.button_pressed;
            let playerCopyingIndex = buttonPressed-1;  
            
            // if the player chooses to copy:
            if (buttonPressed != 0 && player.money >= payToCopy) {
                // update bIsCopying and iPlayerCopying
                bIsCopying = true; 
                iPlayerCopying = buttonPressed;

                // adjust and display the player's money and status: 
                player.money -= payToCopy;
                document.getElementById("money-amount").innerHTML = "Your total amount of money is: " + player.money.toString();
                player.timesCopying++; 

                // and adjust the money of the player being copied
                dummyPlayers[playerCopyingIndex].money += payToCopy;
                dummyPlayers[playerCopyingIndex].numCopied++;
                console.log(`player ${buttonPressed} ${testPlayer(dummyPlayers[playerCopyingIndex])}`);
            }
            // if tried to copy but doesn't have enough money, warn player
            else if (data.button_pressed != 0 && player.money < payToCopy) { 
                alert("You do not have enouch money to copy."); 
                data.button_pressed = 0; 
            }
            // if not copying, update bIsCopying to match
            else bIsCopying = false; 

            jsPsych.resumeExperiment(); 
        }
        else { 
            // PLACEHOLDER FOR EVENT HANDLER
            jsPsych.resumeExperiment(); 
        }
    }
}