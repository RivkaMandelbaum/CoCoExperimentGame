/* This file contains the wrapper for experiment logic for Artwork Selection Experiment. 
It declares a number of constants, sets up the experiment, and 
adds trials to timeline. 
The trials are defined in trialdefs.js. The training trials are defined in instructions-trialdefs.js.
The functions are defined in func-defs files: 
	- backend-funcs.js deals with sending/receiving responses
	- get-data-funcs.js deals with getting/using data saved by trials
	- player-funcs.js contains functions updating or creating players
	- build-table-funcs.js contains functions that build table of players' results in different conditions. 
	- timer-funcs.js contains functions that work on the countdown timer
	- art-funcs.js deals with functions relating to Artwork objects 
*/ 


/* ----------------------------------------------------------*/ 
/* constants that will be used later defined here:           */ 
/* ----------------------------------------------------------*/  
	/* load psiturk */ 
	var psiturk = new PsiTurk(uniqueId, adServerLoc, mode);

	/* MIGHT NEED TO ADD SOME STUFF HERE, CHECK PSITURK API, EXAMPLE CODE BELOW IN COMMENT */ 
	var mycondition = parseInt(condition);  // these two variables are passed by the psiturk server process
	// var mycounterbalance = counterbalance;  // they tell you which condition you have been assigned to 

	// give names to the condition meanings
	const TOTAL_MONEY_CONDITION = 0; 
	const DIRECT_REWARD_CONDITION = 1;

	/* quantities of parts of experiment*/           
	const NUM_IMAGES = 5; // the number of artworks displayed (used in offline mode)
	const NUM_DECISIONS = 19; // the number of rounds of the real game, also needed to calculate start amount and skip last "choice" buttons

	/* money-related */
	const COPY_FEE = 1; // amount you need to pay someone to copy their choices
	const START_MONEY = COPY_FEE * NUM_DECISIONS; // amount of money you start with
	
	/* mode */
	const offlineMode = (mode == "debug");

	/* placeholders */  
	const IMG1 = {
		id: 1,
		name: "water with mountain",
		filepath: "../static/images/img1.jpg", 
		value: 1,
	};
	const IMG2 = {
		id: 2,
		name: "people on beach",
		filepath: '../static/images/img2.jpg',
		value: 2,
	};
	const IMG3 = {
		id: 3,
		name: "blue blob",
		filepath: '../static/images/img3.jpg',
		value: 3,
	};
	const IMG4 = {
		id: 4, 
		name: "red land with sunset and water",
		filepath: '../static/images/img4.jpg',
		value: 4,
	};
	const IMG5 = {
		id: 5, 
		name: "mountains with river",
		filepath: '../static/images/img5.jpg',
		value: 5
	};
	
/* ------------------------------------------------------------ */ 
/* global variables (not const)                                 */     
/* ------------------------------------------------------------ */
	/* related to players */ 
	let numPlayers = 5; // adjusted if live
	let numOtherPlayers = numPlayers - 1; // adjusted if live
	
	let self; // your self; will be defined after consent
	let players = []; // array to hold players; filled after consent

	/* related to your point in the experiment */ 
	let numExecutions = 0; // number of rounds thru timeline 
	let numTimeRanOut = 0; // number of times you didn't make a choice before the time ran out
	let failedAttentionCheck = false; // whether they failed attention checks

	
	/* data structures for mapping */ 
	let idLookup = {}; // maps player ids to position in players array
	let orderLookup = {}; // keys = trial index, values = order of images as shown to player 

	const CONDITION_LOOKUP = { // condition code lookup 
		0: buildTable_TotalPayoff,
		1: buildTable_DirectPayoff,
		2: buildTable_CopyPayoff, // not currently in use
	}
	
/* ------------------------------------------------------------ */ 
/* define trials on timeline                                    */     
/* ------------------------------------------------------------ */

	/* add instruction trials */
	let timeline = []; // timeline for experiment

	instructions_explanation.conditional_function = isValidPlayer; 
	quiz_timeline.conditional_function = isValidPlayer; 

	let instruction_trials = {
		timeline: [
			instructions_explanation, 
			{timeline: startTrial, conditional_function: isValidPlayer}, 
			{timeline: mechanism_rounds, conditional_function: isValidPlayer}, 
			{timeline: training_rounds, conditional_function: isValidPlayer}, 
			quiz_timeline
		]
	};

	timeline.push(instruction_trials);
	timeline.push({timeline: [welcome_node], conditional_function: isValidPlayer});

	/* define art_decision_procedure as three trials: art display and selection, displaying player results, and choice to copy */ 
	let art_decision_procedure = { 
		timeline: [
			// if not copying: display art and allow selection; update money of all players
			{
				timeline: art_choice_wrap, 
				conditional_function: function() { 
					// return true when the player will select 
					return !self.is_copying;  
				}, 
			},
			// if copying: display art and disallow selection; update money of all players 
			{
				timeline: art_display_wrap, 
				conditional_function: function() { 
					// return true when the player does not select
					return self.is_copying; 
				}  
			},
			// display player's results and allow choice to copy (or "continue" in last round)
			{
				timeline: [results_display_node],
			},
			// update stats for all players, self.is_copying, playerState.player_copying_id if copying (except last round)
			{
				timeline: [results_display_wait_node],
				conditional_function: function() {
					let is_last = numExecutions >= NUM_DECISIONS;
					if (is_last) {
						for (let i = 0; i < numPlayers; i++) { 
							let p = players[i];
							console.log(p.name + ":");
							p.logPlayerStats();
						}
					}
					
					return !is_last;
				}
			}
		],
		repetitions: NUM_DECISIONS+1,
		conditional_function: isValidPlayer,
	}
	timeline.push(art_decision_procedure);

	/* Page to add if they get kicked out of the experiment */ 
	let kicked_out = { 
		type: "html-keyboard-response", 
		stimulus: "You have been removed from the experiment for one of the following reasons: ran out of time; failed attention check. If you believe this is in error, please contact us.",
		choices: jsPsych.NO_KEYS, 
		trial_duration: 2000,
	}

	let kicked_out_node = { 
		timeline: [kicked_out], 
		conditional_function: function() { 
			return !(isValidPlayer());
		}
	}
	timeline.push(kicked_out_node);

	/* End of experiment page as trial */ 
	let goodbye = { 
		type: "html-keyboard-response", 
		stimulus: "Thanks for participating. The experiment is over. You can close the browser window.",
		choices: jsPsych.NO_KEYS, 
		data: { 
			orders: orderLookup,
			players: function() { 
				return players;
			}
		},
		trial_duration: 2000 // Remove this when not debugging (need this line for displayData())
	};
	timeline.push(createNodeWithTrial(goodbye));  

	/* start the experiment */ 
	jsPsych.init({
		timeline: timeline, 
		display_element: 'jspsych-target',
		on_data_update: function(data) {
			//psiturk.recordTrialData(data); /* CHECK PSITURK API */
			console.log(`------ record trial ${data.trial_index} data here ------`);
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