/* ------------------------------------------------------------ */ 
/* Definitions of training trials for Artwork Selection         */
/* Experiment.                                                  */   
/* Author: Rivka Mandelbaum                                     */  
/* ------------------------------------------------------------ */
const trainingTrialDuration = (60 * 1000);
const trainingNumDecisions = 3; 

/* ---- pages of text to introduce the game ---- */
let game_goal = "<div id='game-goal'>placeholder</div>";
let copy_fee = "<div id='copy-fee'>placeholder</div>";

let instructions_explanation = {
    timeline: [
        {
            type: "instructions",
            on_start: function() { 
                intervalID = startTimer(trainingTrialDuration/ 1000);
                document.getElementById("money-amount").innerHTML = "Your total amount of money is: " + startAmount.toString();
            },
            pages: ["<div id = 'instructions-welcome'><h1>Welcome to the game of Art Connoisseur!</h1></div>"],
            show_clickable_nav: true,            
            allow_backward: false,
            on_finish: function() { 
                clearInterval(intervalID);
            },
        },
        {
            type: "instructions",
            on_start: function() { 
                intervalID = startTimer(trainingTrialDuration * 3 / 1000);
            },
            show_clickable_nav: true,
            allow_backward: false,
            pages: [
                game_goal,
                "<div id = 'art-values'><h1>The arts and their values</h1><p>The artwork values can be $1, $2, $3, $4, $5, $6, $7, $8, $9, or $10.</p><p>The value of the artwork you selected will become your bonus.</p><p>That is, if the art you selected is worth $1, you will earn 1 cent; if it is worth $10, you will earn 10 cents.</div>",
                "<div id= 'copy-explanation'><h1>Learn from an art connoisseur</h1><p>You will see how you and others did after each round.</p><p>In each round you can either select the artwork on your own, or you can learn from others.</p><p>If you think there is a player who is really good at the game, you can choose to copy their selections.</p></div>",
        
            ],
            // the game only accesses these constants during actual gameplay
            on_load: function() { 
                document.getElementById("game-goal").innerHTML = `<div id='game-goal-wrapper'><h1>A chance to earn bonus money</h1><p>Imagine you are invited to an art museum with ${numPlayers} other players.</p><p>In each round, all players will be shown ${numImages} randomly selected artworks. </p><p>You will be asked to choose the art that you think is the most expensive.</p></div>`;
            },
            on_finish: function() { 
                clearInterval(intervalID);
            }
        },
        {
            type: "instructions",
            on_start: function() { 
                intervalID = startTimer(trainingTrialDuration * 3 / 1000);
            },
            show_clickable_nav: true,
            allow_backward: false,
            pages: [
                copy_fee,
                "<div id='time'><h1>Let's keep it in time</h1><p>Please complete your decision within the designated time at each round. If you do not finish in time, your choice will be made for you, and if you run out of time in three rounds, you will be removed from the game.</p><p>Your total amount of money earned can be found on the bottom right of the screen.</p></div>",
                "<div id = 'practice'><h1>Practice</h1><p>We hope you will enjoy this game!</p><p>Let's first practice a little bit.</p><p>Press next to begin practice.</p></div>",
            ],
            // the game only accesses these constants during actual gameplay
            on_load: function() { 
                document.getElementById("copy-fee").innerHTML = `<div id='copy-fee-wrapper'><h1>Pay $${payToCopy} to learn from others</h1><p>If you decide to copy, all you need to do is pay $1 (worth 1 real cent) to that player.</p><p>If you copy someone, you receive the same reward as they do.</p><p>If you copy, you will be able to see the artworks, but you will not select on your own.</p></div>`;
            },
            on_finish: function() { 
                clearInterval(intervalID);
            }
        }]
    }


/* ---- experiment setup timeline ---- */ 
// functionality to perform after players have all joined
// plus waiting screen 
let startWait = { 
    type: "waiting",
    prompt: "Please wait for other players.", 
    trial_function: function() { 
        // display initial amount of money 
        document.getElementById("money-amount").innerHTML = "Your total amount of money is: " + startAmount.toString();

        // returns object with numPlayers, self id, and other ids as array 
        // if offline, will return dummy values of those 
        let initObject = getPlayerInfo(offlineMode); 
        numPlayers = initObject.players; 

        // define player 
        let self = initObject.self_info; 
        player = new createPlayer(self.id, self.name, self.avatar_filepath, self.condition);
        showSidebarInfo(); 

        // define dummy players 
        for(i = 0; i < numPlayers; i++) {
            let other_info = initObject.player_info[i];
            let otherPlayer = new createPlayer(other_info.id, other_info.name, other_info.avatar_filepath, other_info.condition);

            dummyPlayers[i] = otherPlayer;
            idLookup[otherPlayer.id] = i; 
        }
    }, 
    on_finish: function() { 
        // update participant condition data
        getDataAtIndex(jsPsych.progress().current_trial_global).participant_condition = player.condition; 
    }, 
    data: {
        participant_condition: "placeholder", // to be updated when player.condition is received from backend
    },
    max_trial_duration: function() { return duration(offlineMode)},
    function_ends_trial: true,  
}

let startTrial = [startWait];

/* --- trials to learn the mechanisms of the game --- */
let intro_mechanism_trial = {
    type: "html-keyboard-response",
    stimulus: function() { 
        return `<h1>Welcome!</h1><p>To other players, you will appear as: <div id='player-name-avatar'><img src=${player.avatar_filepath} id ='intro-player-avatar' />${player.name.replace("(you)", "")}</div>`;
    }, 
    prompt: "Press any key to continue.",
    trial_duration: 10 * trainingTrialDuration,
    response_ends_trial: true,
    on_start: function() { 
        intervalID = startTimer(trainingTrialDuration / 1000);
    },
    on_finish: function() { 
        clearInterval(intervalID);
    }
}

/* first practice round: showing images */
let first_mechanism_trial = { 
    type: "multi-image-button-response", 
    on_start: function() { 
        intervalID = startTimer(trainingTrialDuration / 1000);
    },
    choices: function() {
        img_array = [img1, img2, img3, img4, img5]
        let ch = []
        for(i = 0; i < numImages; i++) { 
            ch.push(`<img src = ${img_array[i].filepath}></img>`);
        }
        return ch;
    },
    button_html: function() { 
        // give a red border to buttons selected incorrectly in the last round
        let default_html = '<button class="jspsych-btn">%choice%</button>';
        
        let last_data = getDataAtIndex(jsPsych.progress().current_trial_global-1);
        let was_wrong = last_data.trial_type == "multi-image-button-response";
        
        if(was_wrong){
            btn_html = []
            for(i = 0; i < numImages; i++) { 
                if(i == last_data.button_pressed) {
                    btn_html.push('<button class="jspsych-btn" id="incorrect-response">%choice%</button>')
                }
                else { 
                    btn_html.push(default_html);
                }
            }
            return btn_html;
        }
        else { 
            return default_html;
        }
    },
    preamble: "<p>This is how you will see artworks in future rounds. Please select the <strong>first (leftmost)</strong> artwork and <strong>ignore</strong> the instruction below.</p>",
    prompt: "Please select what you think is the <strong> highest-value </strong> artwork.",
    response_ends_trial: true,
    trial_duration: function() { return trainingTrialDuration},
    on_finish: function() { 
        clearInterval(intervalID);

        // update the players based on the (hardcoded) amount that they earned
        player.money += img1.value;
        player.total_reward += img1.value;
        for (let i = 0; i < numPlayers; i++) {
            dummyPlayers[i].money += img1.value;
            dummyPlayers[i].total_reward += img1.value;
        }
    }, 
}

let first_mechanism_timeline = {
    timeline: [first_mechanism_trial],
    loop_function: function(data) { 
        // return true when it should loop
        return (data.values()[0].button_pressed !== 0);
    }
}

let correct_player = -1;

let second_mechanism_round = { 
    type: "html-button-response",
    on_start: function() { 
        intervalID = startTimer(trainingTrialDuration / 1000);
    },
    stimulus: function() {
        // set a random correct player for this round (only if correct_player has not yet been set, so the player remains the same if they get it wrong the first time)
        if(correct_player === -1) { 
            let rand_player = Math.floor(Math.random() * numPlayers);
            correct_player = rand_player;
        }

        let explanation_string = `<p>This screen provides information about each player. In a normal round, you may choose to continue deciding on your own, or to pay $${payToCopy} to copy another player. In this round, to show that you understand, please choose to copy <strong>${dummyPlayers[correct_player].name}</strong>.</p>`;


        // create table with preamble, prompt to return
        let tablefunc = conditionLookup[mycondition]; 
        let s = explanation_string + tablefunc();

        s += (`<p id='next-round-instructions'>In the next round, you may either choose the highest-value artwork on your own or pay another player $${payToCopy} to copy their choice.</p></div>`);


        return s;
    },
    prompt: "<div class='prompt'>Which player would you like to copy?</div>",
    choices: function() { 
        let ch = ["None, I would like to make my own choice."];
        for (i = 0; i < numPlayers; i++) { 
            ch.push(`${dummyPlayers[i].name}`);
        }
        return ch; 
    },
    button_html: function() { 
        // give a red border to buttons selected incorrectly in the last round
        let default_html = '<button class="jspsych-btn">%choice%</button>';
        
        let last_data = getDataAtIndex(jsPsych.progress().current_trial_global-1);
        let was_wrong = last_data.trial_type == "html-button-response";
        
        if(was_wrong){
            btn_html = []
            for(i = 0; i < numImages; i++) { 
                if(i == last_data.button_pressed) {
                    btn_html.push('<button class="jspsych-btn" id="incorrect-response">%choice%</button>')
                }
                else { 
                    btn_html.push(default_html);
                }
            }
            return btn_html;
        }
        else { 
            return default_html;
        }
    },
    response_ends_trial: true,
    trial_duration: function() { return trainingTrialDuration},
    on_finish: function() { 
        clearInterval(intervalID);
    },
};

let second_mechanism_timeline = {
    timeline: [second_mechanism_round],
    loop_function: function(data) { 
        return(data.values()[0].button_pressed !== (correct_player+1));
    }
}

let mechanism_rounds = [intro_mechanism_trial, first_mechanism_timeline, second_mechanism_timeline];

let transition_screen = {
    type: "html-button-response", 
    stimulus: "Nice job! You'll play a few more practice rounds, then answer some questions before moving to the real game.",
    choices: ["Continue"],
    on_start: function() { 
        intervalID = startTimer(trainingTrialDuration / 1000);
    },
    on_finish: function() { 
        clearInterval(intervalID);
    }

}

let instructions_artDisplaySelectionChoice = Object.assign({}, artDisplaySelectionChoice);
instructions_artDisplaySelectionChoice.preamble = "<p id='practice-explanation'>This is a practice round. Your choices in this round do not impact your final bonus.</p>";
let instructions_artDisplaySelection = [instructions_artDisplaySelectionChoice, artDisplaySelectionWait];

let instructions_artDisplayCopyChoice = Object.assign({}, artDisplayCopyChoice);
instructions_artDisplayCopyChoice.preamble =  function() { 
    if (playerState.is_copying) { 
        let pos = idLookup[playerState.player_copying_id];
        let name = dummyPlayers[pos].name;
        return `<p id='practice-explanation'>This is a practice round. Your choices in this round do not impact your final bonus.</p><p id='copying-no-choice-explanation'>Because you're copying ${name}, you can't choose an artwork in this round. Here are the artworks that ${name} is choosing from.</p>`   
    }
    else {
        console.warn("Art display copy trial reached, but playerState.is_copying is false!");
    }
}
let instructions_artDisplayCopy = [instructions_artDisplayCopyChoice, artDisplayCopyWait];

let realistic_training_trials = {
    timeline: [
			// if not copying: display art and allow selection; update money of all players
			{
                // timeline: instructions_artDisplaySelection, 
                timeline: instructions_artDisplaySelection,
				conditional_function: function() { 
					// return true when the player will select 
					return !playerState.is_copying;  
                }, 
			},
			// if copying: display art and disallow selection; update money of all players 
			{
				timeline: instructions_artDisplayCopy, 
				conditional_function: function() { 
					// return true when the player does not select
					return playerState.is_copying; 
				}  
			},
            // display player's results and allow choice to copy (or "continue" in last round)
            // using trainingNumDecisions, so not the same as trialdefs version
			{
                type: "html-button-response",
                on_start: function() { 
                    intervalID = startTimer(trainingTrialDuration / 1000);
                },
                stimulus: function() { 
                    let s = "<p id='practice-explanation'>This is a practice round. Your choices in this round do not impact your final bonus.</p>"
                    
                    s += conditionLookup[player.condition]();

                    if(numExecutions < trainingNumDecisions) { 
                        s += (`<div id='next-round-instructions'>In the next round, you may either choose the highest-value artwork on your own or pay another player $${payToCopy} to copy their choice.</div></div>`);
                    }
                    return s;
                },
                prompt: function() { 
                    if (numExecutions < trainingNumDecisions) { 
                        return "<div class='prompt'>Which player would you like to copy?</div>";
                    }
                    else return; 
                },
                choices: function() { 
                    if (numExecutions < trainingNumDecisions) { 
                        let ch = ["None, I would like to make my own choice."];
                        for (i = 0; i <numPlayers; i++) { 
                            ch.push(`${dummyPlayers[i].name}`);
                        }
                        return ch; 
                    }
                    else {
                        return ["Continue to end of practice."];
                    }
                }, 
                data: {
                    dummy_choices: "Placeholder",        
                    player_money: function() { return player.money },
                    player_reward: function() { return player.total_reward },
                    dummy_money: function() { return dummyPlayers.map(p => p.money) },
                    dummy_reward: function() { return dummyPlayers.map(p => p.total_reward) }
            
                },
                on_finish: function() { 
                    clearInterval(intervalID)
                },
                response_ends_trial: true,
                trial_duration: trainingTrialDuration,
			},
			// update stats for all players, playerState.is_copying, playerState.player_copying_id if copying (except last round)
			{
                timeline: [chooseToCopyWait],
                on_start: function() { 
                    console.log("hello")
                    console.log(jsPsych.progress().current_trial_global)
                    console.log(player)
                    console.log(dummyPlayers)
                },
                on_finish: function() { 
                    console.log(player)
                    console.log(dummyPlayers)
                }
				// conditional_function: function() {
				// 	let is_last = numExecutions >= trainingNumDecisions;
				// 	if (is_last) {
				// 		console.log(`${player.name}: ${testPlayer(player)}`);
				// 		for(i = 0; i < numPlayers; i++){
				// 			let d = dummyPlayers[i];
				// 			console.log(`${d.name}: ${testPlayer(d)}`);
				// 		}
				// 	}
					
				// 	return !is_last;
				// }
			}
        ],
        repetitions: 3
    }

let training_rounds = [transition_screen, realistic_training_trials];

let correct_answers = {};
let correctness = [true, true, true];

let quiz_round = {
    type: "survey-multi-choice",
    on_load: function() { 
        for (let i = 0; i < 3; i++) { 
            if (!correctness[i]) { 
                let html = document.querySelector(`.question-${i}-text`);
                html.id = "incorrect-response";
            }
        }

    },
    preamble: function(){ 
        let build_table_func = conditionLookup[player.condition];
        return build_table_func() + "Please scroll to answer these questions before continuing to the game."
    },
    questions: function() { 
        let questions = [];
        correct_answers = [];

        // define answers for first question
        let quiz_answers = [player.name];
        for(let i=0; i<numPlayers; i++) { 
            quiz_answers.push(dummyPlayers[i].name);
        }
        quiz_answers.push("Not enough information");

        // define first question
        let money = { 
            name: "money",
            prompt: "<span class='question-0-text'>Which player has the most money? If two players are equal, you may select either.</span>",
            options: quiz_answers,
            required: true,
        }
        questions.push(money);

        // find the best players for the next question and to find the correct answer
        let best_player_names = [];
        let best_dummy_player = "another player";
        let most_money = 0;

        // make the sort happen by different properties depending on condition
        let dummy_players_attribute = dummyPlayers.map(function(p) { 
            if (player.condition == 0) return p.money;
            else if (player.condition == 1) return p.total_reward;
        })
        let player_attribute = player.money;
        if (player.condition == 1) player_attribute = player.total_reward;

        // find best dummy player
        for (let i = 0; i < numPlayers; i++) { 
            let curr_money = dummy_players_attribute[i];
            if (curr_money> most_money) { 
                most_money = curr_money;
                best_dummy_player = dummyPlayers[i].name;
            }
        }

        // find list of players with the most amount of money
        if (player_attribute >= most_money) best_player_names.push(player.name);
        for (let i = 0; i < numPlayers; i++) { 
            if (dummy_players_attribute[i] == most_money) best_player_names.push(dummyPlayers[i].name);
        }

        correct_answers.money = best_player_names;
       
        // define second question
        let copy_fee = { 
            name: "copy_fee",
            prompt: `<span class='question-1-text'>If you wanted to copy ${best_dummy_player}, how much money would you have to pay?</span>`,
            options: ["$0.5", "$1", "$2", "$3", "$4", "Other"]
        }
        questions.push(copy_fee);
        correct_answers.copy_fee = `$${payToCopy}`;

        // define strings for third question
        const direct_payoff_condition = "Only art value";
        const copy_payoff_condition = "Only copy fee";
        const total_payoff_condition = "Both art value and copy fee"

        // define third question
        let total_meaning = { 
            name: "total_meaning",
            prompt: "<span class='question-2-text'>What is included in the value shown in the right-hand (money) column?</span>",
            options: [direct_payoff_condition, copy_payoff_condition, total_payoff_condition, "Neither art value nor copy fee", "I don't know"]
        }
        questions.push(total_meaning);
        if(player.condition == 0) correct_answers.total_meaning = total_payoff_condition;
        else if(player.condition == 1) correct_answers.total_meaning = direct_payoff_condition;
        else console.warn("Inconsistent conditions");

        return questions;
    },
    randomize_question_order: false,
    button_label: "Continue to the game",
}

let quiz_timeline = { 
    timeline: [quiz_round],
    loop_function: function() { 
        // return true when it should loop 
        let data = JSON.parse(getDataAtIndex(jsPsych.progress().current_trial_global-1).responses);

        if(!correct_answers.money.includes(data.money)) correctness[0] = false;
        else { 
            if(!correctness[0]) correctness[0] = true;
        }
        if(data.copy_fee != correct_answers.copy_fee) correctness[1] = false;
        else { 
            if(!correctness[1]) correctness[1] = true;
        }
        if(data.total_meaning != correct_answers.total_meaning) correctness[2] = false;
        else { 
            if(!correctness[2])correctness[2] = true;
        }

        return correctness.includes(false);
    },
    on_start: function() { 
        intervalID = startTimer(trainingTrialDuration * 2 / 1000);
    },
    on_finish: function() { 
        clearInterval(intervalID);
    }
}