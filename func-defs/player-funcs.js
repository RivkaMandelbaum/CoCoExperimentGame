/* PLAYER CREATION, TESTING, AND MODIFICATION */ 

// creates a player with startAmount of money and numCorrect, numCopied, timesCopying all set to 0. numCorrect and numCopied are useful for testing and in case we want to display those later
function createPlayer(id, name, avatar_filepath, condition) { 
    this.id = id;   
    this.name = name; 
    this.avatar_filepath = avatar_filepath;
    this.condition = condition;

    this.money = startAmount;
    this.numCorrect = 0;
    this.numCopied = 0;
    this.timesCopying = 0; 
}

// tests whether the player object is consistent and returns the player's stats as an array
function testPlayer(p) {
    if(!'money' in p || !'numCorrect' in p || !'numCopied' in p || !'timesCopying' in p) console.warn("Error! Parameter does not have correct fields.");

    if (p.money != startAmount + p.numCopied*payToCopy + p.numCorrect*rewardForCorrect - p.timesCopying*payToCopy) console.warn("Player error! ID and name: " + p.id + " " + p.name);
    
    let stats = [`id: ${p.id}`, `$: ${p.money}`, `cor: ${p.numCorrect}`, `was_cop: ${p.numCopied}`, `copied: ${p.timesCopying}`, `condition: ${p.condition}`];

    return stats;  
}     

// update the stats of players who were correct in a given round
// assumes up-to-date timeline variables, tests each player and logs to console 
function updateCorrect(trial_index) { 
    for (i = 0; i < numPlayers; i++) { 
            let currentPlayer = dummyPlayers[i];
            if(isDummyCorrect(currentPlayer.id, trial_index)) {
                currentPlayer.money += rewardForCorrect;
                currentPlayer.numCorrect ++;
            }
            console.log(`${currentPlayer.name}: ${testPlayer(currentPlayer)}`); 
        }
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
            player.numCopied += currObj.num_who_copied; 

            player.money += currObj.delta_money;

            document.getElementById("money-amount").innerHTML = "Your total amount of money is: " + player.money.toString();

            if (currObj.copying) player.timesCopying++; 

            console.log(`${player.name}: ${testPlayer(player)}`);
        }
        // updating others
        else { 
            currPlayer = convertIdToPlayer(currObj.id);

            currPlayer.numCopied += currObj.num_who_copied;
            currPlayer.money += currObj.delta_money;

            if(currObj.copying) currPlayer.timesCopying++;

            console.log(`${currPlayer.name}: ${testPlayer(currPlayer)}`)
        }
    }
}

// given a player id, returns the locally saved player object with that id
function convertIdToPlayer(id) { 
    pos = idLookup[id]; 
    return dummyPlayers[pos]; 
}
