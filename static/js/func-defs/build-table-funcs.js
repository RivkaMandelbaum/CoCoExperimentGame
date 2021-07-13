/* -------------------------------------------------------------------------- */
/* Functions that build a string of HTML representing the table which shows   */
/* players' responses.                                                        */
/* The different functions are for different conditions.                      */
/* Author: Rivka Mandelbaum                                                   */
/* -------------------------------------------------------------------------- */

const TABLE_END_HTML = "</table></div></div>";

/* ---- helper functions ---- */ 
function showImageChosen(s) { 
    let choice_trial_index = jsPsych.progress().current_trial_global - 2; 
    let choice_trial_data = getDataAtIndex(choice_trial_index);
    let choice, name;

    if (choice_trial_data.art_choices != undefined) { 
       
        // find the name and choice of player who chose 
        let pos = (self.is_copying) ? idLookup[self.copying_id] : idLookup[self.id];
        choice = players[pos].art_choice;
        name = players[pos].name;

        if (name.includes("You")) name = "You";

        // create html to display that information 
        if (choice != undefined) { 
            return s + `<div id="stimulus-flexbox-wrapper"><div id="choice-display"><p id="choice-display-caption">${name} chose:</p><img id="choice-display-img" src=${choice.filepath}/></div>`;
        }
        else { 
            return s + `<div id="stimulus-flexbox-wrapper"><div id="choice-display"><p id="choice-display-caption">${name} did not make a choice.</p></div>`;
        }
    }
    // only occurs in first mechanism trial, where image choice is hardcoded
   else { 
       let choice_html = `<div id="stimulus-flexbox-wrapper"><div id="choice-display"><p id="choice-display-caption">You chose:</p><img id="choice-display-img" src=${IMG1.filepath}/></div>`;
       return s + choice_html;;
    };

}

// builds string representing html for intro string and table (up to "Player Pic")
function introString(s){
    return (s + "<div id = 'table-content'><table><th> Player </th>"); 
}

// builds the first columns of the self row of the table: name, avatar
function selfBasic(){
    s = `<tr id = "self"><td class="player-info"><img src =${self.avatar_filepath} width="50vh" height="50vh"></img><div id = "self-name" class="player-name">${self.name}</div></td>`;
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
    if (self.is_copying) { 
        let pos = idLookup[self.copying_id];
        s += `Good choice copying <span id='congrats-player-name'>${players[pos].name}</span>! `;
    }
    s += `Your total bonus earned from artworks and being copied is now <span id='congrats-player-money'>${self.money}</span>!</div>`

    s = showImageChosen(s);

    let table = introString(s) + "<th> Total Bonus from Artworks and Copies </th>";
    const addRowEnd = "</tr>";
    
    // build first row of table (yourself)   
    table += selfBasic() + `<td><span id=money-total>${self.money}</span><span id=amount-earned>+${self.money_earned} this round</span></td` + addRowEnd;

    // build row of table for each player
    for(i = 0; i < numOtherPlayers; i++) {
        let curr = players[i];
        table += otherBasic(curr) + `<td>${curr.money}<span id=amount-earned>+${curr.money_earned} this round</span></td`+ addRowEnd;
    }
    table += TABLE_END_HTML;
    return table; ; 
}

// third column: direct payoff (from correctness)
function buildTable_DirectPayoff(){
    let s = "<div id='stimulus-content'>";
    if(self.reward) { // only a defined, non-zero number
        s += "<div id=congratulations>";
        if (self.is_copying) { 
            let pos = idLookup[self.copying_id];
            s += `Good choice copying <span id='congrats-player-name'>${players[pos].name}</span>! `;
        }
        s += `Your total bonus from artworks is now <span id='congrats-player-money'>${self.reward}</span>!</div>`    
    }

    s = showImageChosen(s);

    let table = introString(s) + "<th> Total Bonus from Artworks </th>";
    const addRowEnd = "</tr>";

    // build first row of table (yourself)    
    table += selfBasic() + `<td id=self-reward-total><span id=reward-total>${self.reward}</span><span id=amount-earned>+${self.reward_earned} this round</span></td` + addRowEnd; 

    // build row of table for each player
    for(i = 0; i < numOtherPlayers; i++) {
        let curr = players[i];

        table += otherBasic(curr) + `<td>${curr.reward}<span id=amount-earned>+${curr.reward_earned} this round</span></td>` + addRowEnd;
    }
    table += TABLE_END_HTML;

    return table; 
}

// --- Not currently in use --- third column: # copied
function buildTable_CopyPayoff(){
    let table = introString("<div id='stimulus-content'>") + "<th> $ earned from being copied </th>";
    const addRowEnd = "</tr>";

    // build first row of table (yourself)    
    table += selfBasic() + `<td>${self.numWasCopied * COPY_FEE}</td` + addRowEnd; 
    

    // build row of table for each player
    for(i = 0; i < numOtherPlayers; i++) {
        table += (otherBasic(players[i]) + `<td>${players[i].numWasCopied * COPY_FEE}</td`+ addRowEnd);
    }
    table += TABLE_END_HTML;
    return table; 
}