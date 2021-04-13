CoCoExperimentGame
Author: Rivka Mandelbaum

CoCoExperimentGame is the frontend source code for an online psychology experiment in the form of a game. The experiment is intended to study unequal distributions of resources as a consequence of cumulative advantage ("the rich get richer"). The experiment consists of a number of rounds which contain two parts: first, the participant is shown a selection of artworks and is asked to choose the highest-value artwork. If they select correctly, they are rewarded for their choice. Next, the participant is shown the results of other players' choices, and is asked to choose whether they would like to choose the highest-value artwork on their own the next time, or whether they would like to pay a different player to copy whatever decision they make and earn a reward if the other player is correct. In the next round, a participant either chooses the artwork on their own or views the artworks and then sees what the person they copied chose, and the game continues for a number of rounds. In this way, the amount of money a given player has is a combination of their own competence (reward earned) and other players' assessment of their copied (money paid to copy them). By mixing these signals, we expect to see cumulative inequality, the extent of which differs based on how much other information players receive.

This directory consists of: 
1) func-defs: a directory containing files with function definitions used in the experiment. 
2) images: a directory of the images referenced in the experiment (currently placeholders)
3) jspsych-6.2.0: a directory of jsPsych plugins and modified plugins used in the experiment. 
4) old-versions: a directory containing older versions of files (kept here to keep a record, but not currently functional)
5) additional-styling.css: a small amount of custom CSS, on top of the existing CSS provided by jsPsych. 
6) experiment.html: the body of the experiment itself, containing some global variables and the experiment timeline. This is a skeleton version that relies on trialdefs.js for the definitions of actual trials. 
7) trialdefs.js: a Javascript file that defines each of the trials used in the experiment. The bulk of the experiment itself is here. 

The front-end development of the game is close to complete. We are working on some tweaks, and the next step is piloting the experiment using this source code. 

Finally, this is my first time working on such a project, so anyone viewing this repository who has expertise and feedback is welcome to provide it. 