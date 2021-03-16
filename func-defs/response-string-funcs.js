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
        curr = dummyPlayers[iPlayerCopying-1];
        response = `You chose to copy ${curr.name}. ${curr.name} chose artwork ${getDummySelection(curr.id, trial_index) + 1}. <br> </br>`;

        if(isDummyCorrect(curr.id, trial_index)) {
            return response + `${dummyPlayers[iPlayerCopying-1].name} was <strong> correct</strong>. You earned $${rewardForCorrect}.`;
        }
        else {
            return response + `${dummyPlayers[iPlayerCopying-1].name} was <strong> incorrect</strong>. The correct value was ${getCorrectArtwork(trial_index) + 1}.`
        }
    }
}

// builds stimulus table for chooseToCopy
// displays all players' choices, correctness, money amount
// returns HTML to be used as stimulus
function buildCopyStimulus(trial_index) {
    let introString = "Here are players' results. <br> </br>";

    let table = "<div id = 'table-content'><table>\
                        <th> Player Name</th>\
                        <th> Player Pic</th>\
                        <th> Correct</th>\
                        <th> Money </th>";
    const addRowEnd = "</tr>";

    // build first row of table (yourself)
    let correct = ""
    if(!bIsCopying) {
        if(isPlayerCorrect(trial_index)) correct = "Yes!";
        else correct = "No";
    }
    else { 
        if(isDummyCorrect(dummyPlayers[iPlayerCopying-1].id, trial_index)) correct = "Yes!";
        else correct = "No";
    }
    
    table += `<tr id = "self"><td>${player.name}</td>\
                <td><img src =${player.avatar_filepath} width = 50vh height = 50vh></img></td>\
                <td>${correct}</td>\
                <td>${player.money}</td></tr>`;

    // build row of table for each player
    for(i = 0; i < numPlayers; i++) {
        let correct = isDummyCorrect(dummyPlayers[i].id, trial_index);

        let addName = `<tr><td>${dummyPlayers[i].name}</td>`;
        let addAvatar = `<td><img src =${dummyPlayers[i].avatar_filepath} width = 50vh height = 50vh></img></td>`;
        let addCorrect = "";
        if(correct) addCorrect = `<td>Yes!</td>`;
        else addCorrect = '<td>No</td>';
        let addMoney = `<td>${dummyPlayers[i].money}</td>`;

        table += (addName + addAvatar + addCorrect + addMoney + addRowEnd);
    }
    table += "</table></div><br></br>";

    s = introString + table; 

    // adds explanation of choice
    s += (`In the next round, you may either choose the highest-value artwork on your own or pay another player $${payToCopy} to copy their choice.`);

    return s; 
}
