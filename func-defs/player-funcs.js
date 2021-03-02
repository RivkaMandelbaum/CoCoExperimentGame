/* PLAYER CREATION, TESTING, AND MODIFICATION */ 

// creates a player with startAmount of money and numCorrect, numCopied, timesCopying all set to 0. numCorrect and numCopied are useful for testing and in case we want to display those later
function createPlayer(id) { 
    this.money = startAmount;
    this.numCorrect = 0;
    this.numCopied = 0;
    this.timesCopying = 0; 
    this.id = id;   
}

// tests whether the player object is consistent and returns the player's stats as an array
function testPlayer(p) {
    if(!'money' in p || !'numCorrect' in p || !'numCopied' in p || !'timesCopying' in p) console.warn("Error! Parameter does not have correct fields.");

    let stats = [p.money, p.numCorrect, p.numCopied];
    if (p.money != startAmount + p.numCopied*payToCopy + p.numCorrect*rewardForCorrect - p.timesCopying*payToCopy) console.warn("Player error!"); 
    return stats;  
}     

// update other players in a given trial assuming up-to-date timeline variables 
// using update logic from art display step - if correct, give reward
// tests each player and logs to console 
function updatePlayerStats(trial_index) { 
    for (i = 0; i < numPlayers; i++) { 
            if(isDummyCorrect(i, trial_index)) {
                dummyPlayers[i].money += rewardForCorrect;
                dummyPlayers[i].numCorrect ++;
            }
            console.log(`player ${i+1} (id ${dummyPlayers[i].id}) ${testPlayer(dummyPlayers[i])}`); 
        }
}