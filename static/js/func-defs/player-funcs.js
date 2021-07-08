/* -------------------------------------------------------------------------- */
/* Functions that deal with player objects: creation, updates, and testing.   */
/* Author: Rivka Mandelbaum                                                   */
/* -------------------------------------------------------------------------- */

/* ---- Functions dealing with Player objects ---- */
// creates a player with $START_MONEY and numCorrect, numWasCopied, numCopyingOther all set to 0. numCorrect and numWasCopied are useful for testing and in case we want to display those later
function Player(id, name, avatar_filepath, condition) { 
    // identifying information 
    this.id = id;   
    this.name = name; 
    this.avatar_filepath = avatar_filepath;
    this.condition = condition;

    // money and copy stats
    this.money = START_MONEY;
    this.reward = 0;
    this.numWasCopied = 0;
    this.numCopyingOther = 0; 

    // current choices, state
    this.is_copying = false;
    this.copying_id = null;
    this.art_choice = null;
    this.money_earned = 0;
    this.reward_earned = 0;
}

// resets player stats (money and number correct, copied, and copying other)
Player.prototype.resetPlayerStats = function() { 
    // money and copy stats 
    this.money = START_MONEY;
    this.reward = 0;
    this.numWasCopied = 0;
    this.numCopyingOther = 0;

    // current choices, state
    this.is_copying = false;
    this.copying_id = null;
    this.art_choice = null;
    this.money_earned = 0;
    this.reward_earned = 0;
}

// tests whether the player object is consistent and returns the player's stats as an array of strings 
Player.prototype.testPlayerStats = function () { 
    let expected_amount = START_MONEY + (this.numWasCopied * COPY_FEE) + (this.reward) - (this.numCopyingOther * COPY_FEE);

    if (this.money != expected_amount) console.warn(`Player ${this.id} (${this.name}) has inconsistent stats! Expected: ${expected_amount}, actual: ${this.money}`);

    if(this.is_copying && this.numCopyingOther === 0) console.warn(`Player ${this.id} (${this.name}) has inconsistent state (copying)!`)

    if (!this.is_copying && this.copying_id != null) console.warn(`Player ${this.id} (${this.name}) is not copying but has copying_id ${this.copying_id}!`);
}

// logs player stats (id and properties whose values change during the game) to the consosle
Player.prototype.logPlayerStats = function() {
    this.testPlayerStats(); 
    console.log(this.getPlayerStats());
}

Player.prototype.getPlayerStats = function() {
    this.testPlayerStats();

    let copying_info = (this.is_copying) ? `is copying ${players[idLookup[this.copying_id]].name}` : `is not copying`;

    let s = `Player ${this.name} (${this.id}):`;
    s += `---- Info: money ${this.money}, reward ${this.reward}, was_cop ${this.numWasCopied}, copy_other ${this.numCopyingOther}`; 
    s += `---- State: ${copying_info}, last chose ${this.art_choice.id}`; 

    return s;
}

/* --- updating all players --- */
/* update the stats of players based on who is copying in a given round
copyingInfo object should be an array of objects received from the server
with the following fields: {
    id: int,
    num_was_copied: int,
    delta_money: int, 
    copying: bool,
    copying_id: int or null if not copying,
    trial_type: "copy",
    trial_index: int
    } 
There should be one object per player including the self.  
*/
function updateCopying(copyingInfo) { 
    for (let i = 0; i < numPlayers; i++) {
        currInfo = copyingInfo[i];
        currPlayer = players[idLookup[currInfo.id]]; // server may not send in sorted order
        
        currPlayer.numWasCopied += currInfo.num_was_copied;
        currPlayer.money += currInfo.delta_money; 
        currPlayer.money_earned += currInfo.delta_money; 

        if (currInfo.copying) {
            currPlayer.numCopyingOther++;
            currPlayer.is_copying = true;
            currPlayer.copying_id = currInfo.copying_id;
        }
    }

    // testUpdateCopying(copyingInfo);
}
// test that the copying info is correct and matches the updated stats
    function testUpdateCopying(copyingInfo){ 
    copyingInfo.forEach((element) => { 
        let curr_player = players[idLookup[element.id]];
        let name = curr_player.name;

        if (element.copying) console.log(`${name} (${element.id}) is copying plyr ${element.copying_id} and has stats: ${curr_player.getPlayerStats()}`);
        else console.log(`${name} (${element.id}) is not copying and has stats: ${curr_player.getPlayerStats()}`);
    });
    return;
}

/* --- miscellaneous player-related functions --- */
// returns true if the player should remain in the game and false if the player should be removed from the game
// criteria for removal: time ran out twice, or failed attention checks
function isValidPlayer() { 
    return (numTimeRanOut < 2) && !failedAttentionCheck; 
}

// given a player id, returns the locally saved player object with that id
function convertIdToPlayer(id) { 
    pos = idLookup[id]; 
    return players[pos]; 
}

function showSidebarInfo() {
    document.getElementById("money-amount").innerHTML = "Your total amount of money is: " + self.money.toString();
    document.getElementById("player-name").innerHTML = self.name;
    document.getElementById("player-avatar").innerHTML = "<img src = " + self.avatar_filepath + " style = 'height: 4vh; width: 4vh;'" + "/>";
}