/* -------------------------------------------------------------------------- */
/* Functions that deal with player objects: creation, updates, and testing.   */
/* Author: Rivka Mandelbaum                                                   */
/* -------------------------------------------------------------------------- */

// creates a player with startAmount of money and numCorrect, numWasCopied, numCopyingOther all set to 0. numCorrect and numWasCopied are useful for testing and in case we want to display those later
function createPlayer(id, name, avatar_filepath, condition) { 
    this.id = id;   
    this.name = name; 
    this.avatar_filepath = avatar_filepath;
    this.condition = condition;

    this.money = startAmount;
    this.total_reward = 0;
    this.numWasCopied = 0;
    this.numCopyingOther = 0; 
}

// resets player stats (money and number correct, copied, and copying other)
function resetPlayerStats(p) {
    p.money = startAmount;
    p.total_reward = 0;
    p.numWasCopied = 0;
    p.numCopyingOther = 0; 
}

// tests whether the player object is consistent and returns the player's stats as an array of strings 
function testPlayer(p) {
    if(!'money' in p || !'numCorrect' in p || !'numWasCopied' in p || !'numCopyingOther' in p) console.warn("Error! Parameter does not have correct fields.");

    let expected_amount = startAmount + (p.numWasCopied * payToCopy) + (p.total_reward) - (p.numCopyingOther * payToCopy);

    if (p.money != expected_amount) console.warn("Player error! ID and name: " + p.id + " " + p.name);
    
    let stats = [`id: ${p.id}`, `$: ${p.money}`, `reward: ${p.total_reward}`, `was_cop: ${p.numWasCopied}`, `copied: ${p.numCopyingOther}`, `condition: ${p.condition}`];

    return stats;  
}     

/* update the stats of players based on who is copying in a given round
copyingInfo object should be an array of objects received from the server
with the following fields: {
    id: int,
    num_who_copied: int,
    delta_money: int, 
    copying: bool,
    copying_id: int or null if not copying,
    trial_type: "copy",
    trial_index: int
    } 
There should be one object per player including the self.  
*/
function updateCopying(copyingInfo) { 
    for (i = 0; i <= numPlayers; i++) { 
        currObj = copyingInfo[i]; 

        // updating self is separate because not in dummyPlayers array
        if (currObj.id == player.id) {
            player.numWasCopied += currObj.num_who_copied; 

            player.money += currObj.delta_money;

            showSidebarInfo();

            if (currObj.copying) player.numCopyingOther++; 

            //console.log(`${player.name}: ${testPlayer(player)}`);
        }
        // updating others
        else { 
            currPlayer = convertIdToPlayer(currObj.id);

            currPlayer.numWasCopied += currObj.num_who_copied;
            currPlayer.money += currObj.delta_money;

            if(currObj.copying) currPlayer.numCopyingOther++;

            //console.log(`${currPlayer.name}: ${testPlayer(currPlayer)}`)
        }
    }
}

// given a player id, returns the locally saved player object with that id
function convertIdToPlayer(id) { 
    pos = idLookup[id]; 
    return dummyPlayers[pos]; 
}

function showSidebarInfo() {
    document.getElementById("money-amount").innerHTML = "Your total amount of money is: " + player.money.toString();
    document.getElementById("player-name").innerHTML = player.name;
    document.getElementById("player-avatar").innerHTML = "<img src = " + player.avatar_filepath + " style = 'height: 4vh; width: 4vh;'" + "/>";
}