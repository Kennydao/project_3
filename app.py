from flask import Flask, render_template, redirect, jsonify, request
import os
import predictionModels
import numpy as np

# from __future__ import print_function
import json
import pickle
from io import StringIO

import pandas as pd

# absolute path to this file
# FILE_DIR = os.path.dirname(os.path.abspath(__file__))

# absolute path to this file's root directory
# PARENT_DIR = os.path.join(FILE_DIR) #, os.pardir)

# dir_of_interest = os.path.join(PARENT_DIR, 'static\data')

app = Flask(__name__)

@app.route("/")
def index():
    # predictionModels.loadPredictiveModels()

    return render_template("index.html")

@app.route("/popuPrediction", methods=['GET', 'POST'])
def popuPrediction():

    # if request.method == 'GET':
    #     bedRoom = request.args.get('selBedroom')
    # if request.method == 'POST':
    #     print(request)
    #     print(request.form["subHouse"])
    #     print(request.form["bedRoom"])
    #     print(request.form["yearHouse"])

    # house = ScoringService.get_model()

    # status = 200 if house else 404

    # calling housing price prediction function
    # classifer = predictionModels.loadPredictiveModels()
    # print(classifer)
    # classifer.predict()
    # results = 1500 # predictive outcome
    # inputYear = int(request.form["yearHouse"])
    # X_observation = np.array(inputYear)
    # X_observation = X_observation.reshape(-1, 1)
    # print(X_observation)

    # regression = predictionModels.loadPredictiveModels()
    # print(regression)
    # result = regression.predict(X_observation)
    # print(result[0])
    # redirect back to homepage
    ##selYear = inputYear, prediction= result[0].to_fixed(2)
    return render_template("popuPrediction.html") #Flask.Response(response='n', status=status, mimetype='application/json') #redirect("/") jsonify(data)

@app.route("/housePricePrediction", methods=['GET', 'POST'])
def housePricePrediction():
    if request.method == 'GET':
        bedRoom = request.args.get('selBedroom')
    if request.method == 'POST':
        print(request)
        print(request.form["subHouse"])
        print(request.form["bedRoom"])
        print(request.form["yearHouse"])


    inputYear = int(request.form["yearHouse"])
    X_observation = np.array(inputYear)
    X_observation = X_observation.reshape(-1, 1)
    print(X_observation)

    regression = predictionModels.loadPredictiveModels()
    print(regression)
    result = regression.predict(X_observation)
    print(result[0])
    # redirect back to homepage
    return render_template("housePricePrediction.html", selYear = inputYear, prediction= result[0].to_fixed(2)) #Flask.Response(response='n', status=status, mimetype='application/json') #redirect("/") jsonify(data)


@app.route("/tab_1")
def tab1():
    # predictionModels.loadPredictiveModels()

    return render_template("tableau_1.html")

@app.route("/tab_2")
def tab2():
    # predictionModels.loadPredictiveModels()

    return render_template("tableau_2.html")

@app.route("/tab_3")
def tab3():
    # predictionModels.loadPredictiveModels()

    return render_template("tableau_3.html")

@app.route("/data_1")
def data_1():
    # predictionModels.loadPredictiveModels()

    return render_template("data_1.html")

@app.route("/data_2")
def data_2():
    # predictionModels.loadPredictiveModels()

    return render_template("data_2.html")

@app.route("/data_3")
def data_3():
    # predictionModels.loadPredictiveModels()

    return render_template("data_3.html")

if __name__ == "__main__":
    app.run(debug=True)