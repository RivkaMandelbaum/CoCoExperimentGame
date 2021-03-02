/* FUNCTIONS THAT USE/GET DATA SAVED BY PREVIOUS TRIALS*/

// Returns what the correct answer was in the trial with given index
// Answers are equivalent to indices in the 'choices' array
function getCorrectArtwork (index) { 
    return jsPsych.data.get().filter({'trial_index':index}).select('correct').values[0];
}
// Returns the button selected in trial with given index 
// Buttons are based on indices in the 'choices array' (should be integer between 0 and numImages-1)
function getPlayerSelection(index) {  
    let trial_data = jsPsych.data.get().filter({'trial_index': index});
    return trial_data.select('button_pressed').values[0];
}; 

// Returns whether player was correct in trial with given index.
function isPlayerCorrect(index) { 
    let clicked_correct_data = jsPsych.data.get().filter({'trial_index': index}).select('clicked_correct').values[0];

    if (clicked_correct_data != null) return clicked_correct_data;
    else return(getCorrectArtwork(index) === getPlayerSelection(index));
}

/* ---- Functions for dummy correctness are separated because they're based on timeline variables rather than on previous trial. ---- */ 

// Returns the button dummy player i selected in given trial 
// i should use array index of player, not player name
// buttons based on 'choices' array
function getDummySelection(i, trial_index) { 
    return jsPsych.data.get().filter({'trial_index': trial_index}).select('dummy_choices').values[0][i];
}

// Returns whether dummy player i was correct in given trial
// i should use array index of player, not player name
function isDummyCorrect(i, trial_index) { 
   let cor = jsPsych.data.get().filter({'trial_index': trial_index}).select('correct').values[0];
  
   return getDummySelection(i, trial_index) === cor;
}