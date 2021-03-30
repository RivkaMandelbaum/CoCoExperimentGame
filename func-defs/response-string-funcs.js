/* BUILDING AND RETURN STIMULUS STRINGS*/

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
        if(isDummyCorrect(playerCopyingID, trial_index)) correct = "Yes!";
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

    return s; 
}
