/* This file contains the wrapper for experiment logic for Artwork Selection Experiment. 
It declares a number of constants, sets up the experiment, and 
adds trials to timeline. 
The trials are defined in trialdefs.js. 
The functions are defined in func-defs files: 
	- backend-funcs.js deals with sending/receiving responses
	- get-data-funcs.js deals with getting/using data saved by trials
	- player-funcs.js contains functions updating or creating players
	- build-table-funcs.js contains functions that build table of players' results in different conditions. 
	- timer-funcs.js contains functions that work on the countdown timer
	--> 
*/ 


/* ----------------------------------------------------------*/ 
/* constants that will be used later defined here:           */ 
/* ----------------------------------------------------------*/  
	/* load psiturk */ 
	var psiturk = new PsiTurk(uniqueId, adServerLoc, mode);

	/* MIGHT NEED TO ADD SOME STUFF HERE, CHECK PSITURK API, EXAMPLE CODE BELOW IN COMMENT */ 
	var mycondition = condition;  // these two variables are passed by the psiturk server process
	// var mycounterbalance = counterbalance;  // they tell you which condition you have been assigned to 

	// condition code lookup 
	const conditionLookup = { 
		0: buildTable_TotalPayoff,
		1: buildTable_DirectPayoff,
		2: buildTable_NumWasCopied,
	}

	/* quantities of parts of experiment*/           
	const numImages = 5; // the number of artworks displayed (used in offline mode)
	const numDecisions = 6; // number of times you choose to copy, also needed to calculate start amount and skip last "choice" buttons

	/* money-related */
	const payToCopy = 2; // amount you need to pay someone to copy their choices
	const rewardForCorrect = 10; // amount you get when you choose the right answer
	const startAmount = payToCopy * numDecisions; // amount of money you start with
	
	/* mode */
	const offlineMode = (mode == "debug");

	/* placeholders */  
	const img1 = {
		id: 1,
		name: "red",
		filepath: "../static/images/img1.jpg"
	};
	const img2 = {
		id: 2,
		name: "orange",
		filepath: '../static/images/img2.jpg',
	};
	const img3 = {
		id: 3,
		name: "yellow",
		filepath: '../static/images/img3.jpg'
	};
	const img4 = {
		id: 4, 
		name: "green",
		filepath: '../static/images/img4.jpg'
	};
	const img5 = {
		id: 5, 
		name: "blue",
		filepath: '../static/images/img5.jpg'
	};
	

/* ------------------------------------------------------------ */ 
/* global variables (not const)                                 */     
/* ------------------------------------------------------------ */
	/* related to whether you are copying at a given time */ 
	let playerState = {
		is_copying: false, // whether the player is currently copying
		player_copying_id: -1, // which player they're copying (if any)
	}

	/* related to players */ 
	let numPlayers = 4; // number of other players - adjusted if live
	let player; // your self; will be defined after consent
	let dummyPlayers = []; // array to hold other players; defined after consent

	/* related to your point in the experiment */ 
	let numExecutions = 0; // number of rounds thru timeline 
	let numTimeRanOut = 0; // number of times you didn't make a choice before the time ran out
	
	/* data structures for mapping */ 
	let idLookup = {}; // maps player ids to position in dummyPlayers
	let orderLookup = {}; // keys = trial index, values = order of images as shown to player 
/* ------------------------------------------------------------ */ 
/* define trials on timeline                                    */     
/* ------------------------------------------------------------ */ 
	/* add experiment setup trial*/ 
	let timeline = [{timeline: startTrial}]; // timeline for experiment 

	/* define welcome message as a trial */
	let welcome = {
		type: "html-keyboard-response",
		stimulus: `Welcome to the experiment. <br> </br> You will begin with $${startAmount}, as will other players. <br> </br> Press any key to begin.`
	}; 
	timeline.push(welcome); 

	/* define art_decision_procedure as three trials: art display and selection, displaying player results, and choice to copy */ 
	let art_decision_procedure = { 
		timeline: [
			// if not copying: display art and allow selection; update money of all players
			{
				timeline: artDisplaySelection, 
				conditional_function: function() { 
					// return true when the player will select 
					return !playerState.is_copying;  
				}, 
			},
			// if copying: display art and disallow selection; update money of all players 
			{
				timeline: artDisplayCopy, 
				conditional_function: function() { 
					// return true when the player does not select
					return playerState.is_copying; 
				}  
			},
			// display player's results and allow choice to copy (or "continue" in last round)
			{
				timeline: [chooseToCopyChoice],
			},
			// update stats for all players, playerState.is_copying, playerState.player_copying_id if copying (except last round)
			{
				timeline: [chooseToCopyWait],
				conditional_function: function() {
					let is_last = numExecutions >= numDecisions;
					if (is_last) {
						console.log(`${player.name}: ${testPlayer(player)}`);
						for(i = 0; i < numPlayers; i++){
							let d = dummyPlayers[i];
							console.log(`${d.name}: ${testPlayer(d)}`);
						}
					}
					
					return !is_last;
				}
			}
		],
		repetitions: numDecisions+1,
	}
	timeline.push(art_decision_procedure);

	/* End of experiment page as trial */ 
	let goodbye = { 
		type: "html-keyboard-response", 
		stimulus: "Thanks for participating. The experiment is over. You can close the browser window.",
		choices: jsPsych.NO_KEYS, 
		data: { 
			orders: orderLookup,
		},
		trial_duration: 2000 // Remove this when not debugging (need this line for displayData())
	};
	timeline.push(goodbye);  

	/* start the experiment */ 
	jsPsych.init({
		timeline: timeline, 
		display_element: 'jspsych-target',
		on_data_update: function(data) {
			//psiturk.recordTrialData(data); /* CHECK PSITURK API */
			console.log("placeholder for recording trial data on update")
		},
		on_finish: function () {
			if(offlineMode){
				jsPsych.data.displayData();

				jsPsych.pluginAPI.setTimeout(function() { 
					psiturk.completeHIT();
				}, (300 * 1000));
			}
			else { 
				/* save data - CHECK PSITURK API*/
			psiturk.completeHIT();
			}
			
		},
		show_progress_bar: true 
	}); 