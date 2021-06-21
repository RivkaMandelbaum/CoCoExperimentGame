/* -------------------------------------------------------------------------- */
/* Functions that build a string of HTML representing the table which shows   */
/* players' responses.                                                        */
/* The different functions are for different conditions.                      */
/* Author: Rivka Mandelbaum                                                   */
/* -------------------------------------------------------------------------- */

/* ---- helper functions ---- */ 
// builds string representing html for intro string and table (up to "Player Pic")
function introString(s){
    return (s + "<div id = 'table-content'><table><th> Player </th>"); 
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

/* --- functions for each condition ---- */ 
/* each return the HTML for a table with columns Name and Avatar, with additional columns depending on condition, to be displayed as a stimulus*/

// third column: total payoff 
function buildTable_TotalPayoff(){
    let s = "<div id='stimulus-content'><div id=congratulations>";
    if (playerState.is_copying) { 
        let pos = idLookup[playerState.player_copying_id];
        s += `Good choice copying <span id='congrats-player-name'>${dummyPlayers[pos].name}</span>! `;
    }
    s += `Your total money is now <span id='congrats-player-money'>${player.money}</span>!</div>`

    let table = introString(s) + "<th> Total Money </th>";
    const addRowEnd = "</tr>";
    
    // find change between this trial and last trial
    let previous_money_index = jsPsych.progress().current_trial_global-4;
        // DEAL WITH EDGE CASES: mechanism round (where it says +0), fixed first round with the if undefined logic above
    let amount_earned = getAmountEarned(previous_money_index, player.id);

    // build first row of table (yourself)    
    table += selfBasic() + `<td><span id=money-total>${player.money}</span><span id=amount-earned>+${amount_earned} this round</span></td` + addRowEnd;

    // build row of table for each player
    for(i = 0; i < numPlayers; i++) {
        let amount_earned = getAmountEarned(previous_money_index, dummyPlayers[i].id);
        let to_add = (otherBasic(dummyPlayers[i]) + `<td>${dummyPlayers[i].money}<span id=amount-earned>+${amount_earned} this round</span></td`+ addRowEnd);

        table += to_add;
    }
    table += "</table></div>";
    return table; ; 
}


// third column: direct payoff (from correctness)
function buildTable_DirectPayoff(){
    let s = "<div id='stimulus-content'>";
    if(player.total_reward != 0) { 
        s += "<div id=congratulations>";
        if (playerState.is_copying) { 
            let pos = idLookup[playerState.player_copying_id];
            s += `Good choice copying <span id='congrats-player-name'>${dummyPlayers[pos].name}</span>! `;
        }
        s += `Your total reward from artworks is now <span id='congrats-player-money'>${player.total_reward}</span>!</div>`    
    }

    let table = introString(s) + "<th> Total Reward from Artworks </th>";
    const addRowEnd = "</tr>";

    // build first row of table (yourself)    
    table += selfBasic() + `<td id=self-reward-total>${player.total_reward}</td` + addRowEnd; 

    // build row of table for each player
    for(i = 0; i < numPlayers; i++) {
        table += (otherBasic(dummyPlayers[i]) + `<td>${dummyPlayers[i].total_reward}</td`+ addRowEnd);
    }
    table += "</table></div>";

    return table; 
}

// --- Not currently in use --- third column: # copied
function buildTable_CopyPayoff(){
    let table = introString("<div id='stimulus-content'>") + "<th> $ earned from being copied </th>";
    const addRowEnd = "</tr>";

    // build first row of table (yourself)    
    table += selfBasic() + `<td>${player.numWasCopied * payToCopy}</td` + addRowEnd; 
    

    // build row of table for each player
    for(i = 0; i < numPlayers; i++) {
        table += (otherBasic(dummyPlayers[i]) + `<td>${dummyPlayers[i].numWasCopied * payToCopy}</td`+ addRowEnd);
    }
    table += "</table></div>";
    return table; 
}