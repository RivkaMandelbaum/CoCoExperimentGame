/* ------------------------------------------------------------ */ 
/* Definitions of training trials for Artwork Selection         */
/* Experiment.                                                  */   
/* Author: Rivka Mandelbaum                                     */  
/* ------------------------------------------------------------ */
const trainingTrialDuration = (60 * 1000);
const trainingNumDecisions = 3; 
/* two pages of text to introduce the game*/
let instruction_text = "<div id='instructions'>hello</div>";
let intro = {
    type: "instructions",
    on_load: function() { 
        document.getElementById("instructions").innerHTML = `<div id="instructions-welcome" style="font-weight: bold; margin-bottom: 3vh;">Welcome to the game!</div><ul id="instructions-bullets" style="text-align: left"><li id="game-goal">The <strong>goal</strong> of the game is to find the <strong>highest-value artworks</strong>, either on your own or by copying a teammate, to earn money.</li><li id="two-parts">Each round has two parts:</li><ol id="parts"><li id="first-part">First, you'll be shown ${numImages} artworks. Each artwork is worth between $1 and $10</strong>. <ul id="if-correct"><li id="if-correct">In each round, you will get a reward of <strong>the value of the artwork you chose</strong>.</li><li id="if-wrong">There is no penalty for guessing wrong.</li></ul><li id="second-part">Next, you'll see how you and others did, and you'll be able to choose whether you would like to find the highest-value artwork <strong>on your own</strong> in the next round, or whether you would like to <strong>copy someone else</strong> by paying them $${payToCopy}.</li><ul id="if-copy"><li id="if-copy-reward">If you copy someone, you receive the same reward that they do.</li><li id="if-copy-see">You will be able to see the artworks while copying, but you will not select an artwork on your own.</li></ul></ol><li id="sidebar-info">Each round must be completed in the amount of time shown in the bottom left of the screen. Your total amount of money earned can be found on the bottom right of the screen.</li>`;
    },
    pages: [instruction_text, "You'll now be shown a few practice rounds, with which you can interact. Press next to begin practice."], 
    show_clickable_nav: true,
    show_page_number: true,
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
        
        let last_data = jsPsych.data.get().filter({'trial_index':jsPsych.progress().current_trial_global-1}).values()[0];
        let was_wrong = last_data.trial_type == "multi-image-button-response";
        
        if(was_wrong){
            btn_html = []
            for(i = 0; i < numImages; i++) { 
                if(i == last_data.button_pressed) {
                    btn_html.push('<button class="jspsych-btn" id="incorrect-response-btn">%choice%</button>')
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
    prompt: "Training Round 1: To show that you understand the mechanism, select the <strong>first</strong> (leftmost) artwork. You will move to the next screen only when you have made the correct choice",
    response_ends_trial: true,
    trial_duration: function() { return trainingTrialDuration},
    on_finish: function() { 
        clearInterval(intervalID);
    }
}
let first_mechanism_timeline = {
    timeline: [first_mechanism_trial],
    loop_function: function(data) { 
        // return true when it should loop
        return (data.values()[0].button_pressed !== 0);
    }
}

let second_mechanism_round = { 
    type: "html-button-response",
    on_start: function() { 
        intervalID = startTimer(trainingTrialDuration / 1000);
    },
    stimulus: function() {
        let tablefunc = conditionLookup[mycondition]; 
        let s = tablefunc();
        let explanation_string = `This screen provides information about each player. In a normal round, you may choose to continue deciding on your own, or to pay $${payToCopy} to copy another player. In this round, to show that you understand, please choose to copy ${dummyPlayers[1].name}.`;

        return s + explanation_string;
    },
    prompt: `You will move to the next screen when you choose to copy the correct player`,
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
        
        let last_data = jsPsych.data.get().filter({'trial_index':jsPsych.progress().current_trial_global-1}).values()[0];
        let was_wrong = last_data.trial_type == "html-button-response";
        
        if(was_wrong){
            btn_html = []
            for(i = 0; i < numImages; i++) { 
                if(i == last_data.button_pressed) {
                    btn_html.push('<button class="jspsych-btn" id="incorrect-response-btn">%choice%</button>')
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
    }
};

let second_mechanism_timeline = {
    timeline: [second_mechanism_round],
    loop_function: function(data) { 
        return(data.values()[0].button_pressed !== 2);
    }
}

let mechanism_rounds = [first_mechanism_timeline, second_mechanism_timeline];

let transition_screen = {
    type: "html-button-response", 
    stimulus: "Nice job! You'll play a few more practice rounds, then answer some questions before moving to the real game.",
    choices: ["Continue"],
}

let realistic_training_trials = {
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
            // using trainingNumDecisions, so not the same as trialdefs version
			{
                type: "html-button-response",
                on_start: function() { 
                    intervalID = startTimer(trainingTrialDuration / 1000);
                },
                stimulus: function() { 
                    let s = conditionLookup[player.condition]();

                    if(numExecutions < numDecisions) { 
                        s += (`In the next round, you may either choose the highest-value artwork on your own or pay another player $${payToCopy} to copy their choice.`);
                    }
                    return s;
                },
                prompt: function() { 
                    if (numExecutions < trainingNumDecisions) { 
                        return "Which player would you like to copy?";
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
                        return ["Continue to end of experiment."];
                    }
                }, 
                data: {
                    dummy_choices: "Placeholder"
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
				conditional_function: function() {
					let is_last = numExecutions >= trainingNumDecisions;
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
        repetitions: 3
    }

let training_rounds = [transition_screen, realistic_training_trials];

let quiz_round = {
    type: "survey-multi-choice",
    preamble: function(){ 
        return conditionLookup[player.condition]() + "Please answer these questions before continuing to the game."},
    questions: function() { 
        let questions = [];

        // define answers for options
        let quiz_answers = ["Me"];
        for(let i=0; i<numPlayers; i++) { 
            quiz_answers.push(dummyPlayers[i].name);
        }
        quiz_answers.push("Not enough information");

        // define each trial
        let competence = { 
            name: "competence",
            prompt: "Which player is the best at choosing high-value artworks? If two players are equal, you may select either.",
            options: quiz_answers,
            required: true,    
        }
        questions.push(competence);

        let copied = { 
            name: "copied",
            prompt: "Which player has been copied the most times? If two players are equal, you may select either.",
            options: quiz_answers,
            required: true, 
        }
        questions.push(copied);

        let money = { 
            name: "money",
            prompt: "Which player has the most money? If two players are equal, you may select either.",
            options: quiz_answers,
            required: true,
        }
        questions.push(money);

        return questions;
    },
    randomize_question_order: true,
    button_label: "Continue to the game",
    on_finish: function() { 
        resetPlayerStats(player);
        showSidebarInfo();

        for(let i = 0; i < numPlayers; i++) { 
            resetPlayerStats(dummyPlayers[i]);
        }

        playerState.is_copying = false;
        playerState.player_copying_id = -1; 
        numExecutions = 0; 
    },

}