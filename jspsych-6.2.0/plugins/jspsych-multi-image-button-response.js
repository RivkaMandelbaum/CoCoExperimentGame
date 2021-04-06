/**
 * jspsych-multi-image-button-response
 *
 * plugin for displaying multiple image stimuli and getting a button response
 *
 **/

jsPsych.plugins["multi-image-button-response"] = (function() {

  var plugin = {};

  // jsPsych.pluginAPI.registerPreload('multi-image-button-response', 'stimulus', 'image');

  plugin.info = {
    name: 'multi-image-button-response',
    description: 'Takes an array of images and of choices. Displays images, choices displayed as buttons. Takes optional correct_choice and returns correct (boolean) if given.',
    parameters: {
      stimulus: {
        type: jsPsych.plugins.parameterType.IMAGE,
        pretty_name: 'Stimulus',
        default: null,
        array: true,
        description: 'The images to be displayed'
      },
      stimulus_height: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Image height',
        default: null,
        description: 'Set the image height in pixels'
      },
      stimulus_width: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Image width',
        default: null,
        description: 'Set the image width in pixels'
      },
      maintain_aspect_ratio: {
        type: jsPsych.plugins.parameterType.BOOL,
        pretty_name: 'Maintain aspect ratio',
        default: true,
        description: 'Maintain the aspect ratio after setting width or height'
      },
      choices: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Choices',
        default: undefined,
        array: true,
        description: 'The labels for the buttons.'
      },
      correct_choice: { 
        type: jsPsych.plugins.parameterType.INT, 
        pretty_name: 'Correct choice',
        default: null, 
        description: 'The correct button.'
      },
      button_html: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Button HTML',
        default: '<button class="jspsych-btn">%choice%</button>',
        array: true,
        description: 'The html of the button. Can create own style.'
      },
      prompt: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Prompt',
        default: null,
        description: 'Any content here will be displayed under the button.'
      },
      stimulus_duration: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Stimulus duration',
        default: null,
        description: 'How long to hide the stimulus.'
      },
      trial_duration: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Trial duration',
        default: null,
        description: 'How long to show the trial.'
      },
      margin_vertical: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Margin vertical',
        default: '0px',
        description: 'The vertical margin of the button.'
      },
      margin_horizontal: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Margin horizontal',
        default: '8px',
        description: 'The horizontal margin of the button.'
      },
      response_ends_trial: {
        type: jsPsych.plugins.parameterType.BOOL,
        pretty_name: 'Response ends trial',
        default: true,
        description: 'If true, then trial will end when user responds.'
      },
      render_on_canvas: {
        type: jsPsych.plugins.parameterType.BOOL,
        pretty_name: 'Render on canvas',
        default: true,
        description: 'If true, the image will be drawn onto a canvas element (prevents blank screen between consecutive images in some browsers).'+
          'If false, the image will be shown via an img element.'
      }
    }
  }

  plugin.trial = function(display_element, trial) {

    // if the stimulus is provided, create a canvas element 
    var heights = [], widths = [];
    var html;
    if (trial.render_on_canvas) {
      if(trial.stimulus == null) {
        console.log("Error from jspsych-multi-image-button-response. When render on canvas is true but stimulus is not provided, a blank 1x1 canvas will be inserted onto the page, which may interfere with formatting.")
      }
      // first clear the display element (because the render_on_canvas method appends to display_element instead of overwriting it with .innerHTML)
      if (display_element.hasChildNodes()) {
        // can't loop through child list because the list will be modified by .removeChild()
        while (display_element.firstChild) {
          display_element.removeChild(display_element.firstChild);
        }
      }
      // create canvas element 
      var canvas = document.createElement("canvas");
      canvas.id = "multi-stimulus";
      canvas.style.margin = 0;
      canvas.style.padding = 0;

      let padwidth = 20; // between images


      if(trial.stimulus != null) {
        // create images 
        img_array = [];

        for(let i = 0; i < trial.stimulus.length; i++) { 
          let img = new Image(); 

          img.src = trial.stimulus[i]; 

          img_array.push(img); 
        }

        // determine image height and width
        if (trial.stimulus_height !== null) { // heights were specified 
          if (trial.stimulus_height.length != trial.stimulus.length) console.warn("There must be the same number of images and image-heights provided!");

          for(let i = 0; i < trial.stimulus_height.length; i++) { 
            heights.push(trial.stimulus_height[i]);
          }
          
          // if no widths provided AND maintaining aspect ratio, use heights to determine widths
          if (trial.stimulus_width == null && trial.maintain_aspect_ratio) {
            for(let i = 0; i < trial.stimulus_height.length; i++){
              widths.push(img_array[i].naturalWidth * (trial.stimulus_height[i]/img_array[i].naturalHeight));
            }
          }
        } else { // heights were not specified
            for(let i = 0; i < img_array.length; i++) { 
              heights.push(img_array[i].naturalHeight);
            }
        }

        if (trial.stimulus_width !== null) { // widths were specified
          if(trial.stimulus_width.length != trial.stimulus.length) console.warn("There must be the same number of images and image-widths provided!");
          for(let i = 0; i < img_array.length; i++){
            widths.push(trial.stimulus_width[i]);
          }

          // if no heights provided AND maintaining aspect ratio, use widths to determine heights
          if (trial.stimulus_height == null && trial.maintain_aspect_ratio) {
            for(let i = 0; i < trial.stimulus_height.length; i++) {
              heights.push(img_array[i].naturalHeight * trial.stimulus_width[i]/img_array[i].naturalWidth);
            }
          }
        } else if (!(trial.stimulus_height !== null & trial.maintain_aspect_ratio)) { 
          // when this else-if is reached, width is not provided
          // it would only have been set if heights were provided AND maintain_aspect_ratio is true
          // in other cases, it needs to be set here
          for (let i = 0; i < img_array.length; i++) { 
            widths.push(img_array[i].naturalWidth);
          }
        } 
      

        // set canvas size to fit images
        let maxHeight = 0;
        for(let i = 0; i < heights.length; i++) {
          if (heights[i] > maxHeight) maxHeight = heights[i];
        }
        canvas.height = maxHeight; 

        let totalWidth = 0;
        for(let i = 0; i < widths.length; i++){
          totalWidth += widths[i];
        }
        canvas.width = totalWidth + (padwidth *(widths.length - 1));
      }
      else{
        canvas.height = 1;
        canvas.width = 1;
      }

      // create buttons
      var buttons = [];
      if (Array.isArray(trial.button_html)) {
        if (trial.button_html.length == trial.choices.length) {
          buttons = trial.button_html;
        } else {
          console.error('Error in multi-image-button-response plugin. The length of the button_html array does not equal the length of the choices array');
        }
      } else {
        for (var i = 0; i < trial.choices.length; i++) {
          buttons.push(trial.button_html);
        }
      }
      var btngroup_div = document.createElement('div');
      btngroup_div.id = "multi-btngroup";
      html = '';
      for (var i = 0; i < trial.choices.length; i++) {
        var str = buttons[i].replace(/%choice%/g, trial.choices[i]);
        html += '<div class="multi-button" style="display: inline-block; margin:'+trial.margin_vertical+' '+trial.margin_horizontal+'" id="multi-button-' + i +'" data-choice="'+i+'">'+str+'</div>';
      }
      btngroup_div.innerHTML = html;

      display_element.insertBefore(canvas, null);

      if (trial.stimulus != null) {
        // add canvas to screen and draw image
        var ctx = canvas.getContext("2d");

        // alternative without canvas:
        // for(let i = img_array.length-1; i >=0; i--) { 
        //   //display_element.insertAdjacentHTML('afterbegin', `<img src = ${img_array[i].src}>`); 
        // }
        let dx = 0;
        for(let i = 0; i < img_array.length; i++) {
          ctx.drawImage(img_array[i],dx,0,widths[i],heights[i])
          dx += widths[i];
          dx += padwidth;
        }
          
      }

      // add buttons to screen
      display_element.insertBefore(btngroup_div, canvas.nextElementSibling);
      // add prompt if there is one
      if (trial.prompt !== null) {
        display_element.insertAdjacentHTML('beforeend', trial.prompt);
      }
    }

    else {
      // use html variable to build html of: stimuli, buttons, and prompt if applicable
      let html = ""; 

      // add stimuli to html as image elements (if applicable)
      if (trial.stimulus !== null) {
        for (let i = 0; i < trial.stimulus.length; i++) {
          html += `<img src = "${trial.stimulus[i]}" class = "multi-image-stimulus" id="jspsych-multi-image-button-response-stimulus-${i}">`;
        }
      }
      // add buttons (using trial.button_html if applicable)
      // first get button_html into array:
      var buttons = []; // html for each button

      if (Array.isArray(trial.button_html)) {
        if (trial.button_html.length == trial.choices.length) {
          buttons = trial.button_html;
        } else {
          console.error('Error in multi-image-button-response plugin. The length of the button_html array does not equal the length of the choices array');
        }
      } else { // if not an array, all html is the same
        for (var i = 0; i < trial.choices.length; i++) {
          buttons.push(trial.button_html);
        }
      }

      // add the div id for the buttons
      html += '<div id="jspsych-image-button-response-btngroup">';

      // add the buttons' html to the html variable
      for (var i = 0; i < trial.choices.length; i++) {
        var str = buttons[i].replace(/%choice%/g, trial.choices[i]);

        html += '<div class="multi-button" style="display: inline-block; margin:'+trial.margin_vertical+' '+trial.margin_horizontal+'" id="multi-button-' + i +'" data-choice="'+i+'">'+str+'</div>';
      }
      
      html += '</div>';

      // add prompt
      if (trial.prompt !== null){
        html += trial.prompt;
      }

      // update the page content
      display_element.innerHTML = html;

      // set image dimensions after image has loaded (so that we have access to naturalHeight/naturalWidth)
      for(let i = 0; i < trial.stimulus.length; i++) {
        var img = display_element.querySelector(`#jspsych-multi-image-button-response-stimulus-${i}`);
        if (trial.stimulus_height !== null) {
          height = trial.stimulus_height;
          if (trial.stimulus_width == null && trial.maintain_aspect_ratio) {
            width = img.naturalWidth * (trial.stimulus_height/img.naturalHeight);
          }
        } else {
          height = img.naturalHeight;
        }
        if (trial.stimulus_width !== null) {
          width = trial.stimulus_width;
          if (trial.stimulus_height == null && trial.maintain_aspect_ratio) {
            height = img.naturalHeight * (trial.stimulus_width/img.naturalWidth);
          }
        } else if (!(trial.stimulus_height !== null & trial.maintain_aspect_ratio)) {
          // if stimulus width is null, only use the image's natural width if the width value wasn't set 
          // in the if statement above, based on a specified height and maintain_aspect_ratio = true
          width = img.naturalWidth;
        }
        img.style.height = height.toString() + "px";
        img.style.width = width.toString() + "px";
      }
        
    }

    // start timing
    var start_time = performance.now();

    for (var i = 0; i < trial.choices.length; i++) {
      display_element.querySelector('#multi-button-' + i).addEventListener('click', function(e){
        var choice = e.currentTarget.getAttribute('data-choice'); // don't use dataset for jsdom compatibility
        after_response(choice);
      });
    }

    // store response
    var response = {
      rt: null,
      button: null,
      clicked_correct: null
    };

    // function to handle responses by the subject
    function after_response(choice) {

      // measure rt
      var end_time = performance.now();
      var rt = end_time - start_time;

      // update response 
      response.button = parseInt(choice);
      response.rt = rt;
      if (trial.correct_choice != null) {
        response.clicked_correct = (response.button === trial.correct_choice); 
      }

      // after a valid response, the stimulus will have the CSS class 'responded'
      // which can be used to provide visual feedback that a response was recorded
      if(!trial.render_on_canvas) {
        display_element.querySelector(`#jspsych-multi-image-button-response-stimulus-${choice}`).className += ' responded';
        display_element.querySelector(`#multi-button-${choice}`).className += '-responded';
      }
      else {
        display_element.querySelector(`#multi-button-${choice}`).className += '-responded';
      }

      // disable all the buttons after a response
      var btns = document.querySelectorAll('.multi-button button');
      for(var i=0; i<btns.length; i++){
        //btns[i].removeEventListener('click');
        btns[i].setAttribute('disabled', 'disabled');
      }

      if (trial.response_ends_trial) {
        end_trial();
      }
    };

    // function to end trial when it is time
    function end_trial() {

      // kill any remaining setTimeout handlers
      jsPsych.pluginAPI.clearAllTimeouts();

      // gather the data to store for the trial
      var trial_data = {
        "rt": response.rt,
        "stimulus": trial.stimulus,
        "button_pressed": response.button, 
        "clicked_correct": response.clicked_correct 
      };

      // clear the display
      display_element.innerHTML = '';

      // move on to the next trial
      jsPsych.finishTrial(trial_data);
    };

    // hide image if timing is set
    if (trial.stimulus_duration !== null) {
      jsPsych.pluginAPI.setTimeout(function() {
        display_element.querySelector('#multi-stimulus').style.visibility = 'hidden';
      }, trial.stimulus_duration);
    }

    // end trial if time limit is set
    if (trial.trial_duration !== null) {
      jsPsych.pluginAPI.setTimeout(function() {
        end_trial();
      }, trial.trial_duration);
    } else if (trial.response_ends_trial === false) {
      console.warn("The experiment may be deadlocked. Try setting a trial duration or set response_ends_trial to true.");
    }
  };

  return plugin;
})();
