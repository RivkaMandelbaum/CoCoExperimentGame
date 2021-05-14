/* ------------------------------------------------------------ */ 
/* Definitions of training trials for Artwork Selection         */
/* Experiment.                                                  */   
/* Author: Rivka Mandelbaum                                     */  
/* ------------------------------------------------------------ */
/* two pages of text to introduce the game*/
let instruction_text = "<div id='instructions'>hello</div>";
let intro = {
    type: "instructions",
    on_load: function() { 
        document.getElementById("instructions").innerHTML = `<div id="instructions-welcome" style="font-weight: bold; margin-bottom: 3vh;">Welcome to the game!</div><ul id="instructions-bullets" style="text-align: left"><li id="game-goal">The <strong>goal</strong> of the game is to find the <strong>highest-value artworks</strong>, either on your own or by copying a teammate, to earn money.</li><li id="two-parts">Each round has two parts:</li><ol id="parts"><li id="first-part">First, you'll be shown ${numImages} artworks and you'll be asked to <strong>click the highest-value artwork</strong>. <ul id="if-correct"><li id="if-correct">If you are correct, you'll get <strong>$${rewardForCorrect}</strong>.</li><li id="if-wrong">There is no penalty for guessing wrong.</li></ul><li id="second-part">Next, you'll see how you and others did, and you'll be able to choose whether you would like to find the highest-value artwork <strong>on your own</strong> in the next round, or whether you would like to <strong>copy someone else</strong> by paying them ${payToCopy}.</li><ul id="if-copy"><li id="if-copy-reward">If you copy someone, you receive the same reward that they do.</li><li id="if-copy-see">You will be able to see the artworks while copying, but you will not select an artwork on your own.</li></ul></ol><li id="sidebar-info">Each round must be completed in the amount of time shown in the bottom left of the screen. Your total amount of money earned can be found on the bottom right of the screen.</li>`;
    },
    pages: [instruction_text, "You'll now be shown a few practice rounds, with which you can interact. Press next to begin practice."], 
    show_clickable_nav: true,
    show_page_number: true,
}
/* first practice round: showing images */
let first_mechanism_trial = { 
    type: "multi-image-button-response", 
    on_start: function() { 
        intervalID = startTimer(trialDuration / 1000);
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
    trial_duration: function() { return trialDuration},
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
let mechanism_rounds = [first_mechanism_timeline];
