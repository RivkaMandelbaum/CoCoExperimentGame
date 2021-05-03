/* -------------------------------------------------------------------------- */
/* Functions that build a string of HTML representing the table which shows   */
/* players' responses.                                                        */
/* The different functions are for different conditions.                      */
/* Author: Rivka Mandelbaum                                                   */
/* -------------------------------------------------------------------------- */

/* ---- helper functions ---- */ 
// builds string representing html for intro string and table (up to "Money")
function introString(){
    let s = "Here are players' results. <br> </br>";

    s += "<div id = 'table-content'><table>\
                        <th> Player Name</th>\
                        <th> Player Pic</th>\
                        <th> Money</th>";

    return s; 
}

// builds string representing what to fill in table for "Correct" column
function correctString(trial_index){
    let correct = ""
    if(!playerState.is_copying) {
        if(isPlayerCorrect(trial_index)) correct = "Yes!";
        else correct = "No";
    }
    else { 
        if(isDummyCorrect(playerState.player_copying_id, trial_index)) correct = "Yes!";
        else correct = "No";
    }
    return correct;
}

// builds the first columns of the self row of the table: name, avatar, money
function selfBasic(){
    s = `<tr id = "self"><td>${player.name}</td>\
    <td><img src =${player.avatar_filepath} width = 50vh height = 50vh></img></td>\
    <td>${player.money}</td>`;
    return s; 
}

// builds first columns of other rows of the table: name, avatar, money
function otherBasic(p) { 
    let addName = `<tr><td>${p.name}</td>`;
    let addAvatar = `<td><img src =${p.avatar_filepath} width = 50vh height = 50vh></img></td>`;
    let addMoney = `<td>${p.money}</td>`;

    return (addName + addAvatar + addMoney);
}

/* --- functions for each condition ---- */ 
/* each return the HTML for a table with columns Name and Avatar, with additional columns depending on condition, to be displayed as a stimulus*/

// columns: money, correct, number of people who copied them
// for condition = "easy"
function buildTable_MoneyCorrectCopied(trial_index){
    let table = introString() + "<th> Correct </th>" + "<th> chosen # times</th>";
    const addRowEnd = "</tr>";

    // build first row of table (yourself)
    let correct = correctString(trial_index);
    let was_copied = player.numWasCopied;
    
    table += selfBasic(); 
    table += `<td>${correct}</td>`;
    table += `<td>${was_copied}</td></tr>`

    // build row of table for each player
    for(i = 0; i < numPlayers; i++) {
        let addBasic = otherBasic(dummyPlayers[i]);
        let correct = isDummyCorrect(dummyPlayers[i].id, trial_index);
        let was_copied = dummyPlayers[i].numWasCopied;

        let addCorrect = "";
        if(correct) addCorrect = `<td>Yes!</td>`;
        else addCorrect = '<td>No</td>';

        let addCopied = `<td>${was_copied}</td>`;

        table += (addBasic + addCorrect + addCopied + addRowEnd);
    }
    table += "</table></div><br></br>";

    return table; 
}

// conditions: money, correct
// for condition "medium"
function buildTable_MoneyCorrect(trial_index){
    let table = introString();
    table += "<th> Correct </th>";

    const addRowEnd = "</tr>";

    // build first row of table (yourself)
    let correct = correctString(trial_index);
    
    table += selfBasic(); 
    table += `<td>${correct}</td></tr>`;

    // build row of table for each player
    for(i = 0; i < numPlayers; i++) {
        let correct = isDummyCorrect(dummyPlayers[i].id, trial_index);
        let addBasic = otherBasic(dummyPlayers[i]);

        let addCorrect = "";
        if(correct) addCorrect = `<td>Yes!</td>`;
        else addCorrect = '<td>No</td>';

        table += (addBasic + addCorrect + addRowEnd);
    }
    table += "</table></div><br></br>";
    return table; 
}

// columns: money
// for condition "hard"
function buildTable_Money(trial_index){
    let table = introString();
    const addRowEnd = "</tr>";

    // build first row of table (yourself)    
    table += selfBasic(); 

    // build row of table for each player
    for(i = 0; i < numPlayers; i++) {
        table += (otherBasic(dummyPlayers[i]) + addRowEnd);
    }
    table += "</table></div><br></br>";
    return table; 
}

