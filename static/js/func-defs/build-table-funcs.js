/* -------------------------------------------------------------------------- */
/* Functions that build a string of HTML representing the table which shows   */
/* players' responses.                                                        */
/* The different functions are for different conditions.                      */
/* Author: Rivka Mandelbaum                                                   */
/* -------------------------------------------------------------------------- */

/* ---- helper functions ---- */ 
// builds string representing html for intro string and table (up to "Player Pic")
function introString(){
    let s = ""
    let trial_data = getDataAtIndex(jsPsych.progress().current_trial_global-2);

    let previous_money_index = jsPsych.progress().current_trial_global-4;
    let amount_earned = calculateAmountEarned(previous_money_index);

    // EDGE CASE FOR INSTRUCTIONS BEING REPEATED NEEDED HERE 
    if(trial_data.order != undefined) { 
        if(playerState.is_copying){
            let pos = idLookup[playerState.player_copying_id]; 
            s = `<div id=congratulations>Good choice copying ${dummyPlayers[pos].name}! You earned $${amount_earned} in the previous round.</div>`;
        }
        else { 
            s = `<div id=congratulations>Good choice! You earned $${amount_earned} in the previous round!</div>`;    
        }
    }

    s += "Here are all the players' results. <br>";

    s += "<div id = 'table-content'><table>\
                        <th> Player </th>";

    return s; 
}

// builds the first columns of the self row of the table: name, avatar
function selfBasic(){
    s = `<tr id = "self"><td class="player-info"><img src =${player.avatar_filepath} width="50vh" height="50vh"></img><div id = "self-name" class="player-name">${player.name}</div></td>`;
    return s; 
}

// builds first columns of other rows of the table: name, avatar
function otherBasic(p) { 
    let rowStart = `<tr id = player-${p.id}>`;
    let addContent = `<td class="player-info"><img src =${p.avatar_filepath} width="50vh" height="50vh"></img><div id=player-${p.id}-name class="player-name">${p.name}</div>`;

    return (rowStart + addContent + "</td>");
}

// calculate the amount player earned between this and previous round
function calculateAmountEarned(index) {
    // find trial data where it saved player_money in previous round
    let trial_data = getDataAtIndex(index);
    let amount_earned = "If you see this, there's an error";

    // edge case for training (mechanism) round
    if(trial_data.trial_type != "html-button-response") { 
        amount_earned = player.money - startAmount; 
    }
    else { 
        let previous_money = trial_data.player_money; 
        if (previous_money === undefined) previous_money = startAmount; // edge case for first training round
        amount_earned = player.money - previous_money;
        
    }

    return amount_earned;
}

/* --- functions for each condition ---- */ 
/* each return the HTML for a table with columns Name and Avatar, with additional columns depending on condition, to be displayed as a stimulus*/

// third column: total payoff 
function buildTable_TotalPayoff(){
    let table = introString() + "<th> Total Money </th>";
    const addRowEnd = "</tr>";

    // find change between this trial and last trial
    let previous_money_index = jsPsych.progress().current_trial_global-4;
        // DEAL WITH EDGE CASES: mechanism round (where it says +0), fixed first round with the if undefined logic above
    let amount_earned = calculateAmountEarned(previous_money_index);
    
    // build first row of table (yourself)    
    table += selfBasic() + `<td><div id=money-total>${player.money}</div><div id=amount-earned>+${amount_earned}!</div></td` + addRowEnd; 

    // build row of table for each player
    for(i = 0; i < numPlayers; i++) {
        table += (otherBasic(dummyPlayers[i]) + `<td>${dummyPlayers[i].money}</td`+ addRowEnd);
    }
    table += "</table></div><br></br>";
    return table; ; 
}


// third column: direct payoff (from correctness)
function buildTable_DirectPayoff(){
    let table = introString() + "<th> total $ from artworks </th>";
    const addRowEnd = "</tr>";

    // build first row of table (yourself)    
    table += selfBasic() + `<td>${player.total_reward}</td` + addRowEnd; 

    // build row of table for each player
    for(i = 0; i < numPlayers; i++) {
        table += (otherBasic(dummyPlayers[i]) + `<td>${dummyPlayers[i].total_reward}</td`+ addRowEnd);
    }
    table += "</table></div><br></br>";

    return table; 
}

// third column: # copied
function buildTable_CopyPayoff(){
    let table = introString() + "<th> $ earned from being copied </th>";
    const addRowEnd = "</tr>";

    // build first row of table (yourself)    
    table += selfBasic() + `<td>${player.numWasCopied * payToCopy}</td` + addRowEnd; 
    

    // build row of table for each player
    for(i = 0; i < numPlayers; i++) {
        table += (otherBasic(dummyPlayers[i]) + `<td>${dummyPlayers[i].numWasCopied * payToCopy}</td`+ addRowEnd);
    }
    table += "</table></div><br></br>";
    return table; 
}