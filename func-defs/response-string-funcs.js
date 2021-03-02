/* BUILDING AND RETURN STIMULUS STRINGS*/

// builds stimulus string for displaySelfResults
// your choice (or choice of personcopying), whether it was correct, current money
// returns string to be used as stimulus 
function buildSelfResultsStimulus(trial_index, bIsCopying, iPlayerCopying) {
    let response = "";
    if(!bIsCopying) {
        if(getPlayerSelection(trial_index) === null) return "Your time ran out."

        let response = "Your choice was button number " + (getPlayerSelection(trial_index)+1) + ". \n"; 

        if (isPlayerCorrect(trial_index)) {
            return response + `Your answer is correct. You earned $${rewardForCorrect}.`; 
        }
        else {
            return response + "Your answer is incorrect. The correct value was: " + (getCorrectArtwork(trial_index)+1) + "."; 
        }
    }
    else { 
        response = `You chose to copy player ${iPlayerCopying}. Player ${iPlayerCopying} chose artwork ${getDummySelection(iPlayerCopying-1, trial_index) + 1}. <br> </br>`;

        if(isDummyCorrect(iPlayerCopying-1, trial_index)) {
            return response + `Player ${iPlayerCopying} was <strong> correct</strong>. You earned $${rewardForCorrect}.`;
        }
        else {
            return response + `Player ${iPlayerCopying} was <strong> incorrect</strong>. The correct value was ${getCorrectArtwork(trial_index) + 1}.`
        }
    }
}

// builds stimulus string for chooseToCopy
// displays other players' choices, correctness, money amount
// returns string to be used as stimulus
function buildCopyStimulus(trial_index) {
    s = "Here are the other player's results. <br> </br>"; 
        for(i = 0; i < numPlayers; i++) {
            if(isDummyCorrect(i, trial_index)) { 
                d_correct = "<strong> correctly </strong>"; 
                }
            else {
                d_correct = "<strong> incorrectly </strong>";
            }

            s = s.concat(`Player ${i+1} ${d_correct} chose artwork ${getDummySelection(i, trial_index) + 1}. Player ${i+1} now has $${dummyPlayers[i].money}. <br> </br>`);
        }

        // adds explanation of choice
        s = s.concat(`You may either choose the highest-value artwork on your own or pay another player $${payToCopy} to copy their choice. <br> </br> <br> </br>`);

        return s; 
}