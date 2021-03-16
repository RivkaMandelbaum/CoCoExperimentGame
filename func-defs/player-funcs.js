/* PLAYER CREATION, TESTING, AND MODIFICATION */ 

// creates a player with startAmount of money and numCorrect, numCopied, timesCopying all set to 0. numCorrect and numCopied are useful for testing and in case we want to display those later
function createPlayer(id, name, avatar_filepath) { 
    this.money = startAmount;
    this.numCorrect = 0;
    this.numCopied = 0;
    this.timesCopying = 0; 
    this.id = id;   
    this.name = name; 
    this.avatar_filepath = avatar_filepath;
}

// tests whether the player object is consistent and returns the player's stats as an array
function testPlayer(p) {
    if(!'money' in p || !'numCorrect' in p || !'numCopied' in p || !'timesCopying' in p) console.warn("Error! Parameter does not have correct fields.");

    let stats = [p.money, p.numCorrect, p.numCopied];
    if (p.money != startAmount + p.numCopied*payToCopy + p.numCorrect*rewardForCorrect - p.timesCopying*payToCopy) console.warn("Player error!"); 
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
            console.log(`player ${i+1} (id ${currentPlayer.id}, name ${currentPlayer.name}, avatar ${currentPlayer.avatar_filepath}) ${testPlayer(currentPlayer)}`); 
        }
}

// update the stats of players based on who is copying in a given round
// parameters: boolean representing whether self is copying, playerCopyingIndex
// representing which player is being copied if self copying, currInfo object
// based on responses by server
function updateCopying(bIsCopying, playerCopyingIndex, currInfo) { 
        // update self and player who you're copying if relevant
        if(bIsCopying){
            player.money -= payToCopy;
            document.getElementById("money-amount").innerHTML = "Your total amount of money is: " + player.money.toString();
            player.timesCopying++; 
    
            // and adjust the money of the player being copied
            dummyPlayers[playerCopyingIndex].money += payToCopy;
            dummyPlayers[playerCopyingIndex].numCopied++;
            console.log(`player ${playerCopyingIndex+1} (id ${dummyPlayers[playerCopyingIndex].id}, name ${dummyPlayers[playerCopyingIndex].name}, avatar ${dummyPlayers[playerCopyingIndex].avatar_filepath}) ${testPlayer(dummyPlayers[playerCopyingIndex])}`);
        }
        
        // if online: update other players based on their info
        if(!offlineMode) { 
            for(i = 0; i < numPlayers; i++) { 
                if (currInfo[i].copy) { 
                    // update player copying
                    dummyPlayers[i].money -= payToCopy;
                    dummyPlayers[i].timesCopying++; 
    
                    // update player being copied
                    dummyPlayers[currInfo[i].who].money += payToCopy;
                    dummyPlayers[currInfo[i].who].numCopied ++;
    
                    console.log(`player ${i+1} copied player ${currInfo[i].who+1}`);
                }
            }
        }
}
