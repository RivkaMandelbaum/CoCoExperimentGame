/* -------------------------------------------------------------------------- */
/* Functions that build a string of HTML representing the table which shows   */
/* players' responses.                                                        */
/* The different functions are for different conditions.                      */
/* Author: Rivka Mandelbaum                                                   */
/* -------------------------------------------------------------------------- */

/* ---- helper functions ---- */ 
// builds string representing html for intro string and table (up to "Player Pic")
function introString(){
    let s = "Here are players' results. <br> </br>";

    s += "<div id = 'table-content'><table>\
                        <th> Player Name</th>\
                        <th> Player Pic</th>";

    return s; 
}

// builds the first columns of the self row of the table: name, avatar
function selfBasic(){
    s = `<tr id = "self"><td>${player.name}</td>\
    <td><img src =${player.avatar_filepath} width = 50vh height = 50vh></img></td>`;
    return s; 
}

// builds first columns of other rows of the table: name, avatar
function otherBasic(p) { 
    let addName = `<tr id = player_${p.id}><td>${p.name}</td>`;
    let addAvatar = `<td><img src =${p.avatar_filepath} width = 50vh height = 50vh></img></td>`;

    return (addName + addAvatar);
}

/* --- functions for each condition ---- */ 
/* each return the HTML for a table with columns Name and Avatar, with additional columns depending on condition, to be displayed as a stimulus*/

// third column: total payoff 
function buildTable_TotalPayoff(){
    let table = introString() + "<th> Total Money </th>";
    const addRowEnd = "</tr>";

    // build first row of table (yourself)    
    table += selfBasic() + `<td>${player.money}</td` + addRowEnd; 

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