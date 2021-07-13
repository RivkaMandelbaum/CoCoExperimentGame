/* ------------------------------------------------------------ */ 
/* Definitions of training trials for Artwork Selection         */
/* Experiment.                                                  */   
/* Author: Rivka Mandelbaum                                     */  
/* ------------------------------------------------------------ */
const TRAINING_TIMER_DURATION = 600; // seconds that timer counts down
const TRAINING_TRIAL_DURATION = (TRAINING_TIMER_DURATION + 1) * 1000; // in ms, force end of decision after this time, +1 to allow timer to reach 0
const TRAINING_NUM_DECISIONS = 2; 

const practice_explanation = "<p id='practice-explanation'>This is a practice round. Your choices in this round do <strong>not</strong> impact your final bonus.</p>";

/* ---- pages of text to introduce the game ---- */
let game_goal = "<div id='game-goal'>placeholder</div>";
let copy_fee = "<div id='copy-fee'>placeholder</div>";

let instructions_node_1 = createNodeWithTrial({
    type: "instructions",
    on_start: function() { 
        intervalID = startTimer(TRAINING_TIMER_DURATION);
        document.getElementById("money-amount").innerHTML = "Your total amount of money is: " + START_MONEY.toString();
    },
    pages: ["<div id = 'instructions-welcome'><h1>Welcome to the game of Art Connoisseur!</h1></div>"],
    show_clickable_nav: true,            
    allow_backward: false,
    on_finish: function() { 
        clearInterval(intervalID);
    },
});

let instructions_node_2 = createNodeWithTrial({
    type: "instructions",
    on_start: function() { 
        intervalID = startTimer(TRAINING_TIMER_DURATION * 3);
    },
    show_clickable_nav: true,
    allow_backward: false,
    pages: [
        game_goal,
        "<div id = 'art-values'><h1>The Arts and Their Values</h1><p>The artwork values can be $1, $2, $3, $4, $5, $6, $7, $8, $9, or $10.</p><p>The value of the artwork you selected will become your bonus.</p><p>That is, if the art you selected is worth $1, you earn 1 cent; if it is worth $10, you earn 10 cents.</div>",
        "<div id= 'copy-explanation'><h1>Learn From an Art Connoisseur</h1><p>You will see how you and others did after each round.</p><p>In each round you can either select the artwork on your own, or you can learn from others.</p><p>If you think there is a player who is really good at the game, you can choose to copy their selections.</p></div>",

    ],
    // the game only accesses these constants during actual gameplay
    on_load: function() { 
        document.getElementById("game-goal").innerHTML = `<div id='game-goal-wrapper'><h1>Choose Arts - Earn Bonus</h1><p>Imagine you are invited to an art museum with ${numOtherPlayers} other players.</p><p>In each round, all players will be shown ${NUM_IMAGES} randomly selected artworks. </p><p>You will be asked to choose the art that you think is the most expensive.</p></div>`;
    },
    on_finish: function() { 
        clearInterval(intervalID);
    }
});

let instructions_node_3 = createNodeWithTrial({
    type: "instructions",
    on_start: function() { 
        intervalID = startTimer(TRAINING_TIMER_DURATION * 3);
    },
    show_clickable_nav: true,
    allow_backward: false,
    pages: [
        copy_fee,
        "<div id='time'><h1>Let's Keep It in Time</h1><p>Please complete your decision within the designated time at each round.</p><p>If you do not finish in time, your choice will be made for you, and if you run out of time in three rounds, you will be removed from the game.</p><p>Your total amount of money earned can be found on the bottom right of the screen.</p></div>",
        "<div id = 'practice'><h1>Practice</h1><p>We hope you will enjoy this game!</p><p>Let's first practice a little bit.</p><p>Press next to begin practice.</p></div>",
    ],
    // the game only accesses these constants during actual gameplay
    on_load: function() { 
        document.getElementById("copy-fee").innerHTML = `<div id='copy-fee-wrapper'><h1>Pay $${COPY_FEE} to Learn From Others</h1><p>If you decide to copy, all you need to do is pay $1 (worth 1 real cent) to that player.</p><p>If you copy someone, you receive the same reward as they do.</p><p>If you copy, you will be able to see the artworks, but you will not select on your own.</p></div>`;
    },
    on_finish: function() { 
        clearInterval(intervalID);
    }
});

let instructions_explanation = {
    timeline: [instructions_node_1, instructions_node_2, instructions_node_3]
};

/* ---- experiment setup timeline ---- */ 
// functionality to perform after players have all joined
// plus waiting screen 
let startWait = { 
    type: "waiting",
    prompt: "Please wait for other players.", 
    trial_function: function() { 
        // display initial amount of money 
        document.getElementById("money-amount").innerHTML = "Your total amount of money is: " + START_MONEY.toString();

        // sets numPlayers and defines Player objects
        // if offline, will return dummy values to fill in objects
        jsPsych.pauseExperiment();
        getPlayerInfo(offlineMode);
    }, 
    data: {
        participant_condition: "placeholder", // to be updated when self.condition is received from backend
    },
    max_trial_duration: function() { return duration(offlineMode)},
    function_ends_trial: true,  
}

let startTrial = [createNodeWithTrial(startWait)];

/* --- trials to learn the mechanisms of the game --- */
let intro_mechanism_trial = createNodeWithTrial({
    type: "html-keyboard-response",
    stimulus: function() { 
        return `<h1>Welcome!</h1><p>To other players, you will appear as: <div id='player-name-avatar'><img src=${self.avatar_filepath} id ='intro-player-avatar' />${self.name.replace("(you)", "")}</div>`;
    }, 
    prompt: "Press any key to continue.",
    trial_duration: 10 * TRAINING_TRIAL_DURATION,
    response_ends_trial: true,
    on_start: function() { 
        getDataAtIndex(jsPsych.progress().current_trial_global - 1).participant_condition = self.condition;
        intervalID = startTimer(TRAINING_TIMER_DURATION);
    },
    on_finish: function() { 
        clearInterval(intervalID);
    }
});

let attempts_first = 0; 

/* first practice round: showing images */
let first_mechanism_trial = createNodeWithTrial({ 
    type: "multi-image-button-response", 
    on_start: function() { 
        intervalID = startTimer(TRAINING_TIMER_DURATION);
    },
    choices: function() {
        img_array = [IMG1, IMG2, IMG3, IMG4, IMG5]
        let ch = []
        for(i = 0; i < NUM_IMAGES; i++) { 
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
            attempts_first++;
            if (attempts_first >= 2) failedAttentionCheck = true;

            btn_html = [];
            for(i = 0; i < NUM_IMAGES; i++) { 
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
    preamble: "<p>This is how you will see artworks in future rounds.</p> <p>Please select the <strong>first (leftmost)</strong> artwork and <strong>ignore</strong> the instruction below.</p>",
    prompt: "Please select what you think is the <strong> highest-value </strong> artwork.",
    response_ends_trial: true,
    trial_duration: function() { return TRAINING_TRIAL_DURATION},
    on_finish: function() { 
        clearInterval(intervalID);

        for (let i = 0; i < numPlayers; i++) { 
            players[i].money += IMG1.value;
            players[i].reward += IMG1.value;
        }
    }, 
});

let first_mechanism_timeline = {
    timeline: [first_mechanism_trial],
    loop_function: function(data) { 
        // return true when it should loop
        return (isValidPlayer() && (data.values()[0].button_pressed !== 0));
    }
}

let correct_player = undefined;
let attempts_second = 0;

let second_mechanism_round = createNodeWithTrial({ 
    type: "html-button-response",
    on_start: function() { 
        intervalID = startTimer(TRAINING_TIMER_DURATION);
    },
    stimulus: function() {
        // set a random correct player for this round (only if correct_player has not yet been set, so the player remains the same if they get it wrong the first time)
        
        if(correct_player === undefined) { 
            correct_player = Math.floor(Math.random() * numOtherPlayers);
        }
        console.log('correct player ', correct_player)
        console.log('players ', players)
        let explanation_string = `<p>This screen provides information about each player.</p><p>To show that you understand, please <strong>ignore</strong> the instruction below and choose to copy <strong>${players[correct_player].name}</strong>.</p>`;
        

        // create table with preamble, prompt to return
        let tablefunc = conditionLookup[mycondition]; 
        let s = explanation_string + tablefunc();

        s += (`<p id='next-round-instructions'>In the next round, you may either choose the highest-value artwork on your own or pay another player $${COPY_FEE} to copy their choice.</p></div>`);


        return s;
    },
    // prompt: "<div class='prompt'>Which player would you like to copy?</div>",
    choices: function() { 
        let ch = ["None, I would like to make my own choice."];
        for (i = 0; i < numOtherPlayers; i++) { 
            ch.push(`${players[i].name}`);
        }
        return ch; 
    },
    button_html: function() { 
        // give a red border to buttons selected incorrectly in the last round
        let default_html = '<button class="jspsych-btn">%choice%</button>';
        
        let last_data = getDataAtIndex(jsPsych.progress().current_trial_global-1);
        let was_wrong = last_data.trial_type == "html-button-response";
        
        if(was_wrong){
            attempts_second++;
            if (attempts_second >= 2) failedAttentionCheck = true;

            btn_html = [];
            for(i = 0; i < NUM_IMAGES; i++) { 
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
    trial_duration: function() { return TRAINING_TRIAL_DURATION},
    on_finish: function() { 
        clearInterval(intervalID);
    },
});

let second_mechanism_timeline = {
    timeline: [second_mechanism_round],
    loop_function: function(data) { 
        return(isValidPlayer() && (data.values()[0].button_pressed !== (correct_player+1)));
    }
}

let mechanism_rounds = [intro_mechanism_trial, first_mechanism_timeline, second_mechanism_timeline];

let transition_screen = createNodeWithTrial({
    type: "html-button-response", 
    stimulus: "Nice job! You'll play a few more practice rounds, then answer some questions before moving to the real game.",
    choices: ["Continue"],
    on_start: function() { 
        intervalID = startTimer(TRAINING_TIMER_DURATION);
    },
    on_finish: function() { 
        clearInterval(intervalID);
    }

});

let instructions_art_choice = Object.assign({}, art_choice);
instructions_art_choice.preamble = practice_explanation;
let instructions_art_choice_wrap = [createNodeWithTrial(instructions_art_choice), createNodeWithTrial(art_choice_wait)];
let instructions_art_display = Object.assign({}, art_display);
instructions_art_display.preamble =  function() { 
    if (self.is_copying) { 
        let pos = idLookup[self.copying_id];
        let name = players[pos].name;
        return `${practice_explanation}<p id='copying-no-choice-explanation'>Because you're copying <strong>${name}</strong>, you can't choose an artwork in this round. Here are the artworks that ${name} is choosing from.</p>`   
    }
    else {
        console.warn("Art display copy trial reached, but self.is_copying is false!");
    }
}
let instructions_art_display_wrap = [createNodeWithTrial(instructions_art_display), createNodeWithTrial(art_display_wait)];

let realistic_training_trials = {
    timeline: [
			// if not copying: display art and allow selection; update money of all players
			createNodeWithTrial({
                timeline: instructions_art_choice_wrap,
				conditional_function: function() { 
					// return true when the player will select 
					return !self.is_copying;  
                }, 
			}),
			// if copying: display art and disallow selection; update money of all players 
			createNodeWithTrial({
				timeline: instructions_art_display_wrap, 
				conditional_function: function() { 
					// return true when the player does not select
					return self.is_copying; 
				}  
			}),
            // display player's results and allow choice to copy (or "continue" in last round)
            // using TRAINING_NUM_DECISIONS, so not the same as trialdefs version
			createNodeWithTrial({
                timeline: [
                createNodeWithTrial({
                    type: "html-button-response",
                    on_start: function() { 
                        intervalID = startTimer(TRAINING_TIMER_DURATION);
                    },
                    stimulus: function() { 
                        
                        let s = practice_explanation;
                        
                        s += conditionLookup[self.condition]();

                        if(numExecutions < TRAINING_NUM_DECISIONS) { 
                            s += (`<div id='next-round-instructions'>In the next round, you may either choose the highest-value artwork on your own or pay another player $${COPY_FEE} to copy their choice.</div></div>`);
                        }
                        return s;
                    },
                    // prompt: function() { 
                    //     if (numExecutions < TRAINING_NUM_DECISIONS) { 
                    //         return "<div class='prompt'>Which player would you like to copy?</div>";
                    //     }
                    //     else return; 
                    // },
                    choices: function() { 
                        if (numExecutions < TRAINING_NUM_DECISIONS) { 
                            let ch = ["None, I would like to make my own choice."];
                            for (i = 0; i < numOtherPlayers; i++) { 
                                ch.push(`${players[i].name}`);
                            }
                            return ch; 
                        }
                        else {
                            return ["Continue to end of practice."];
                        }
                    }, 
                    data: {
                        copy_choices: "Placeholder", 
                        players_money: function() { return players.map(p => p.money)},
                        players_reward: function() { return players.map(p => p.reward)}
                    },
                    on_finish: function() { 
                        clearInterval(intervalID)
                    },
                    response_ends_trial: true,
                    trial_duration: TRAINING_TRIAL_DURATION
                })],

                conditional_function: function() { 
                    return numExecutions < TRAINING_NUM_DECISIONS;
                }
			}),
			// update stats for all players, self.is_copying, playerState.player_copying_id if copying (except last round)
			createNodeWithTrial({
                timeline: [chooseToCopyWait],
                conditional_function: function() {
					let is_last = numExecutions >= TRAINING_NUM_DECISIONS;
					if (is_last) {
                        players.forEach(p => p.logPlayerStats());
					}
					
					return !is_last;
				}
			})
        ],
        repetitions: 3
    }

let training_rounds = [transition_screen, realistic_training_trials];

let correct_answers = {};
let correctness = [true, true, true];
let attempts_quiz = 0;

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
        let build_table_func = conditionLookup[self.condition];
        return build_table_func() + "Please scroll to answer these questions before continuing to the game."
    },
    questions: function() { 
        let questions = [];
        correct_answers = [];

        // define answers for first question
        let quiz_answers = [];
        for(let i=0; i<numPlayers; i++) { 
            quiz_answers.push(players[i].name);
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
        let best_other_player = "another player";
        let most_money = 0;

        // make the sort happen by different properties depending on condition
        let players_property = players.map(function(p) { 
            if (self.condition === TOTAL_MONEY_CONDITION) return p.money;
            else if (self.condition === DIRECT_REWARD_CONDITION) return p.reward;
        })

        // find best other player
        for (let i = 0; i < numOtherPlayers; i++) { 
            let curr_money = players_property[i];
            if (curr_money > most_money) { 
                most_money = curr_money;
                best_other_player = players[i].name;
            }
        }

        // find list of players with the most amount of money
        for (let i = 0; i < numPlayers; i++) { 
            if (players_property[i] >= most_money) best_player_names.push(players[i].name);
        }

        correct_answers.money = best_player_names;
       
        // define second question
        let copy_fee = { 
            name: "copy_fee",
            prompt: `<span class='question-1-text'>If you wanted to copy ${best_other_player}, how much money would you have to pay?</span>`,
            options: ["$0.5", "$1", "$2", "$3", "$4", "Other"]
        }
        questions.push(copy_fee);
        correct_answers.copy_fee = `$${COPY_FEE}`;

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
        if(self.condition == TOTAL_MONEY_CONDITION) correct_answers.total_meaning = total_payoff_condition;
        else if(self.condition == 1) correct_answers.total_meaning = direct_payoff_condition;
        else console.warn("Inconsistent conditions");

        return questions;
    },
    randomize_question_order: false,
    button_label: "Continue to the game",
}

let quiz_timeline = { 
    timeline: [createNodeWithTrial(quiz_round)],
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

        let redo_questions = correctness.includes(false);
        if (redo_questions) attempts_quiz++;
        if (attempts_quiz >= 2) failedAttentionCheck = true; s

        return redo_questions;
    },
    on_start: function() { 
        intervalID = startTimer(TRAINING_TIMER_DURATION * 2);
    },
    on_finish: function() { 
        clearInterval(intervalID);
    }
}