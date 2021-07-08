from flask import Blueprint, request, render_template, jsonify, abort, current_app
# dealing with error
from psiturk.experiment_errors import ExperimentError

# Database setup
from psiturk.db import db_session, init_db
from psiturk.models import Participant
# dealing with json like reading from database
from json import dumps, loads

# explore the Blueprint
custom_code = Blueprint('custom_code', __name__, template_folder='templates', static_folder='static')

#----------------------------------------------
# example computing bonus
#----------------------------------------------

@custom_code.route('/player_information', methods=['GET'])
def player_information():
    print("in player information")
    default_condition = 0
    result = {
        "players": 4,
        "self_info": {
            "id": request.args["ID"],
            "name": "Aima (you)",
            "avatar_filepath": "../static/images/aima.png",
            "condition": request.args["condition"]
        }, 
        "player_info": [
            { 
                "id": 10, 
                "name": "Kabu",
                "avatar_filepath": "../static/images/kabu.png",
                "condition": default_condition
            }, 
            { 
                "id": 2,
                "name": "Reku", 
                "avatar_filepath": "../static/images/reku.png",
                "condition": default_condition
            },
            {
                "id": 30, 
                "name": "Tufa", 
                "avatar_filepath": "../static/images/Tufa.png",
                "condition": default_condition
            },
            {
                "id": 4, 
                "name": "Weki", 
                "avatar_filepath": "../static/images/weki.png",
                "condition": default_condition
            }
        ]
    }
    return jsonify(**{"player_results":result})

@custom_code.route('/compute_bonus', methods=['GET'])
def compute_bonus():
    # check that user provided the correct keys
    # errors will not be that gracefull here if being
    # accessed by the Javascrip client
    if not 'uniqueId' in request.args:
        # i don't like returning HTML to JSON requests... maybe should change this
        raise ExperimentError('improper_inputs')
    uniqueId = request.args['uniqueId']

    try:
        # lookup user in database
        user = Participant.query.\
            filter(Participant.uniqueid == uniqueId).\
            one()
        user_data = loads(user.datastring)  # load datastring from JSON
        bonus = 0

        for record in user_data['data']:  # for line in data file
            trial = record['trialdata']
            if trial['phase'] == 'TEST':
                if trial['hit'] == True:
                    bonus += 0.02
        user.bonus = bonus
        db_session.add(user)
        db_session.commit()
        resp = {"bonusComputed": "success"}
        return jsonify(**resp)
    except:
        abort(404)  # again, bad to display HTML, but...