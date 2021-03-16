/**
 * jspsych-waiting
 * Rivka Mandelbaum
 * 
 * plugin for displaying waiting screen 
 * parameters: 
 *  - required: a function to execute during the trial 
 *  - optional: 
 *    - a prompt to display while waiting 
 *    - a max_trial_duration (maximum time in trial)
 *    - boolean value function_ends_trial 
 * 
 * if function_ends_trial and max_trial_duration is null, the trial
 * will only end when the function does.
 * 
 * if function_ends_trial and max_trial_duration is non-null, the trial
 * will end either when the function is over or when max_trial_duration is 
 * reached, whichever is sooner. 
 * 
 * if function_ends_trial is false and max_trial_duration is null,
 * there is no way to exit the trial. 
 * 
 * if function_ends_trial is false and max_trial_duration is non-null,
 * the trial will end after max_trial_duration. 
 * 
 **/


jsPsych.plugins["waiting"] = (function() {

  var plugin = {};

  plugin.info = {
    name: 'waiting',
    description: '',
    parameters: {
      prompt: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Prompt',
        default: null,
        description: 'Any content here will be displayed on the screen above the waiting symbol.'
      },
      max_trial_duration: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Maximum trial duration',
        default: null,
        description: 'How long to show trial before it ends.'
      },
      trial_function: { 
        type: jsPsych.plugins.parameterType.FUNCTION,
        pretty_name: 'Function to run during trial',
        default: undefined,
        description: 'The function to run during the trial.'
      }, 
      function_ends_trial: {
        type: jsPsych.plugins.parameterType.BOOL,
        pretty_name: 'Function ends trial', 
        default: false, 
        description: "Makes function end trial if true",
      }
    }
  }

  plugin.trial = function(display_element, trial) {

    if (trial.trial_function === undefined) console.warn("trial_function is required!"); 

    // draw
    var new_html = '<div id="jspsych-waiting-prompt">'+trial.prompt+'</div>';
    display_element.innerHTML = new_html;

    display_element.insertAdjacentHTML('beforeend', '<img src = ./images/loading-animation.gif>');

    // function to end trial when it is time
    var end_trial = function() {
      // kill any remaining setTimeout handlers
      jsPsych.pluginAPI.clearAllTimeouts();

      // kill keyboard listeners
      if (typeof keyboardListener !== 'undefined') {
        jsPsych.pluginAPI.cancelKeyboardResponse(keyboardListener);
      }

      var trial_data = { 
        "time_in_function": (time_after_function - time_before_function), 
        "trial_duration": trial.trial_duration 
      }

      // clear the display
      display_element.innerHTML = '';

      // move on to the next trial
      jsPsych.finishTrial(trial_data);
    };

    // set timeout to end trial if max_trial_duration is set
    if (trial.max_trial_duration !== null) {
      jsPsych.pluginAPI.setTimeout(function() {
        end_trial();
      }, trial.max_trial_duration);
    } 
    else if(!trial.function_ends_trial) {
      console.warn("The experiment may be deadlocked. Try setting a trial duration or set function_ends_trial to true.");
    }  

    // execute the function
    var time_before_function = performance.now(); 
    trial.trial_function();
    var time_after_function = performance.now();

    // end trial if function given and function ends trial
    if (trial.function_ends_trial) end_trial();

  };

  return plugin;
})();
