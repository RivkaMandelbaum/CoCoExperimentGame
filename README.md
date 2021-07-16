***---- DIRECTORY STRUCTURE ----***
The top-level directory for the game is CoCoExperimentGame. Psiturk server on/off and debug commands should be run from this directory. 
The directory is formatted according to the structure that psiturk requires. It contains:  
   - static/ (see below)
    - templates/ (see below)
    - config.txt (a configuration file for psiturk)
    - custom.py (custom backend functions)
    - participants.db (participant information database, automatically created by psiturk)
    - arts.csv (csv file with information related to arts for the backend function "artworks")
psiturk also automatically creates server.log and .psiturk_history, but these are in the gitignore since the history during debugging should not be useful. 

The **templates** directory is used to create different pages by psiturk. The only one that contains my code is **exp.html**, which includes the scripts that are needed for the experiment. Note that the order of the files under the comment <!-- experiment logic script and files it references --> must remain in this order due to dependencies. 

The **static** directory contains a number of relevant files and directories:  
    - css/
    - fonts/
    - images/
    - js/
    - lib/
    - favicon.ico 
**css** contains CSS - the custom file that I made is **additional-styling.css**, the others came with psiturk or jspsych. 

**fonts** came with psiturk. 

**images** contains the artworks and avatar images associated with the experiment (note that artworks are in the **artworks/** subdirectory).

**js** contains all of the Javascript code that I've written for this experiment. Important details are:
    - **task.js** is the wrapper for experiment logic. It declares global variables, sets up the experiment, adds trials to the timeline, and runs the experiment.   
    - **instructions-trialdefs.js** and **trialdefs.js** contain definitions of trials for the training rounds and regular rounds, respectively. I have tried to keep these simple and concise, putting complicated funtions or calculations into **func-defs/** files. 
    - **func-defs/** directory contains a number of files with function definitions:
        - **art-funcs.js** contains functions that deal with Artwork objects and getting artworks in a given round. 
        - **backend-funcs.js** contains functions that send and receive data from backend: getting artworks for the round, getting the player information for the experiment, getting the art selections each player made, and getting the copy selections each player made. 
        - **build-table-funcs.js** contains functions that build the HTML for the player results table, depending on the condition the player is in. 
        - **get-data-funcs.js** contains functions that relate to getting data saved by previous trials: getting the data at a given index, getting the button selected at a given index, and checking whether the player chose to copy during the copy trial.
        - **player-funcs.js** contains functions that deal with Player objects: creating, resetting stats, getting stats, logging stats, testing that the amount of money they have is self-consistent, and so on.
        - **timer-funcs.js** contains functions dealing with the timer which appears on the bottom of the screen, including tracking whether the player ran out of time.  

**lib/** contains library files associated with the project, so that someone running the project in the future does not have to find the exact versions we were using at the time. 

**favicon.ico** is the Princeton Psychology department icon, used by psiturk. 

***---- CONCEPTUAL STRUCTURE ----***
The parts of the code that are customized for our experiment are structured in the following way:

exp.html > task.js > instructions-trialdefs.js and trialdefs.js > func-defs functions
                   > additional-styling.css
                   > images/

That is, exp.html is a wrapper for including the scripts needed to run the experiment; task.js is a wrapper that runs the experiment; the trialdefs files define the trials; and the func-defs/ files have functions which perform the experiment logic. It also relies on additional-styling.css and the images directory. 

The experiment can be described as containing a few different parts:
    1. The training trials: 
        a. Instructions
            > At this point the experiment communicates with the server to get information about each player and save that locally
        b. Practicing the mechanism of choosing an artwork and copying (also attention checks)
        c. Playing a few realistic rounds of the game
        d. Quiz round where we ask a few questions to make sure you understood (attention check)
    2. The experiment itself: 
        a. Showing the artworks (if not copying, allow player to choose an artwork)
        b. Showing results and allowing player to choose to copy
        (Repeat until game is over)

On a more technical level, each part of the experiment consists of a display part, where the player sees something and presses a button to make a choice, and a wait part, where the processing of the choices happenss. The trials in the experiment look like this:
  Part 1 -  
  **art_choice_wrap**: (only added to the timeline if player is not copying): 
        **art_choice**: shows artworks as buttons (allows player to choose), and saves each players' choices and the order of the artworks as data. 
        **art_choice_wait**: does the backend and processing related to art choices. Updates your Player object with your latest choice; send that choice to the backend; gets others' choices from the backend and updates their Player object with their choice; and updates each Player object's money and reward based on that information. 
    **art_display_wrap** (only added to the timeline if player is copying): 
        **art_display**: show artworks as a stimulus (no choice allowed)and saves each players' choices and the order of the artworks as data. 
        **art_display_wait**: does the backend and processing related to art choices. Gets others' choices from the backend; updates each Player object's art choice, money and reward based on that information. 
    (EITHER art_choice_wrap OR art_display_wrap will be shown to the player in a given round -- not both.) 

    Part 2 - 
**results_display**: displays table with player results and image showing what player chose, and allows the choice of whether and who to copy. Saves each players' choice, and the players' total money and reward, in the data. 
    **resuslts_display_wait**: does the backend and processing related to copy choices. Updates Player object with mosst recent choice, sends own choice; gets others' choices and updates their Player objects; updates everyone's stats based on others' copy information. 

***---- IMPORTANT OBJECTS AND DATA STRUCTURES ---- ***
**Player** objects: represent individual players (including bots) in the game. These are created at the beginning of the game as soon as the server has sent over the identifying information, and updated continually over the course of the game. 
    They contain:
        1. identifying information - id, name, avatar_filepath, condition
        2. "stats" - total money, total reward, total times they were copied, total times they copied someone else 
        3. current state - whether and who they copied the most recent time they made a choice (is_copying and copying_id), what art they chose (or the person they copied chose) the most recent time they made a choice (art_choice), money_earned in the past round, and reward_earned in the past round. 
    Functions associated:
        resetPlayerStats - useful for transitioning from instructions to real rounds 
        testPlayerStats - check for self-consistency, return stats as array of strings
        logPlayerStats - logs player stats (id and properties whose values change during the game)
        getPlayerStats - returns the player stats rather than logging directly 

    At the end of each round of decisions, the current state associated with the players is saved into data. The state in the Player object itself is then overwritten in the next round. At the end of each round (in the results_display trial) the players' money and reward are recorded. 

**Artwork** objects: represent pieces of Artworks. Properties: name, id, filepath, value. 

**players** array: a global variable that stores all Player objects in the game. The final player (at index numPlayers-1) should be "self" - you. Allows easy iteration over all players. 

**idLookup** object: a dictionary that maps player ids (the keys) to their position in the players array. 

**orderLookup** object: a dictionary that maps trial index to the order of images as shown to the player. 

**createNodeWithTrial**: given a trial definition, wraps it in a conditional function that makes the experiment skip the trial if the player is invalid, which happens when they fail attention checks