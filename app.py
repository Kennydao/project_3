from flask import Flask, render_template, redirect, jsonify, request
from flask import Response
import os, sys
import numpy as np
import joblib
import pickle
import json
import pandas as pd
import io

housePricePred = 0.0
X_observation = 2021
popu_df = pd.read_csv('static/data/Vic_Subs_Popu_2001_2019.csv')

housePrice_df = pd.read_csv('static/data/melb_house_trained_df.csv')

colsLength = 357 # number of colummns in the trained dataset

col_names = []
for i in range(2, len(housePrice_df.columns)):
    col_names.append(housePrice_df.columns[i])

subNameList = []
for name in col_names:
    subName = name.split("_")
    subName = subName[1]
    subNameList.append(subName)

# print(subNameList)

# adapted from GeeksforGeeks.org
def estimate_coef(x, y):
    # number of observations/points
    n = np.size(x)

    # mean of x and y vector
    m_x, m_y = np.mean(x), np.mean(y)

    # calculating cross-deviation and deviation about x
    SS_xy = np.sum(y*x) - n*m_y*m_x
    SS_xx = np.sum(x*x) - n*m_x*m_x

    # calculating regression coefficients
    b_1 = SS_xy / SS_xx
    b_0 = m_y - b_1*m_x

    return(b_0, b_1)

# Function number with comma

app = Flask(__name__)

@app.route("/")
def index():

    return render_template("index.html")

@app.route("/myPrediction", methods=['GET', 'POST'])

def myPrediction():
    # if request.method == 'GET':
    # var1 = request.args.get('suburb')
    # print('Method = GET')

    if request.method == 'POST':
        # print(request.form["bedRoom"])
        # print(request.form["yearHouse"])
        # print(request.form["subHouse"])
        # print(request)
        suburbName = request.form["subHouse"]
        X_observation = request.form["yearHouse"]
        inputYear = int(request.form["yearHouse"])
        inputRoom = int(request.form["bedRoom"])
        X_observation = int(X_observation)
        subHouse = request.form["subHouse"]

    # print(X_observation)

    subArray = popu_df.loc[popu_df['Suburb'] == suburbName]

    if subArray.size > 0:

        # print(subArray)
        y = subArray.iloc[0, 9:19].values
        x = np.array([2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018])

        # executing linear regression function
        # linearFunction(x, y)
        b = estimate_coef(x, y)

        # y_pred = b[0] + b[1]*x

        y_observation = b[0] + b[1]*X_observation

        if subHouse in subNameList:
            # print('Found the suburb in the dataset!', subHouse)

            for i in range(0, len(subNameList)):
                if subNameList[i] == subHouse:
                    pointer = i
                    break

            nArray = np.zeros(colsLength)
            nArray[0] = inputRoom
            nArray[1] = inputYear
            nArray[pointer+2] = 1

            # print(nArray[0], nArray[1])
            # print('nArray',[pointer+1]+ ' , ', nArray[pointer+1])
            nArray = np.array(nArray, ndmin=2)

            # load trained model for prediction
            model = joblib.load('Vic_house_trained_model_1.pkl')

            # print(model)

            outCome = model.predict(nArray)
            outCome = f"{int(outCome):,d}"


            print(outCome)

        return render_template("index.html", popuPrediction = f"{int(y_observation):,d}", housePricePred = outCome)

    else:

        return render_template("index.html", popuPrediction = 'Suburb not found!')

# Median house price
@app.route("/tab_1")
def tab1():


    return render_template("tab_1.html")

# Property sold
@app.route("/tab_2")
def tab2():


    return render_template("tab_2.html")

# Weekly household income
@app.route("/tab_3")
def tab3():


    return render_template("tab_3.html")

# Group age by suburb
@app.route("/tab_4")
def tab4():

    return render_template("tab_4.html")

# Employment by Industry
@app.route("/tab_5")
def tab5():


    return render_template("tab_5.html")

# occupation by suburb
@app.route("/tab_6")
def tab6():

    return render_template("tab_6.html")


@app.route("/data_1")
def data_1():


    return render_template("data_1.html")

@app.route("/data_2")
def data_2():


    return render_template("data_2.html")

@app.route("/data_3")
def data_3():

    return render_template("data_3.html")

@app.route("/projectInfo")
def projectInfo():


    return render_template("index.html")
if __name__ == "__main__":
    app.run(debug=False)