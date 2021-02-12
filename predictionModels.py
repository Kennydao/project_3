from sklearn.model_selection import train_test_split
from sklearn import ensemble
from sklearn.metrics import mean_absolute_error
import joblib

def housingPricePrediction():
    # classifer = joblib.load('house_trained_model.pkl')
    # print('inside housing prediction model')
    # return classifer
    regression = joblib.load('house_linear_model.pkl')
    return regression

def popuGrowthPrediction():
    popuModel = joblib.load('population_trained_model.pkl')
    print('inside population growth prediction model')
    return popuModel

def livingCostPrediction():
    livingCostModel = joblib.load('population_trained_model.pkl')
    print('inside population growth prediction model')
    return livingCostModel

def loadPredictiveModels():

    housePriceModel = housingPricePrediction()
    # popuGrowthModel = popuGrowthPrediction()
    # livingCostModel = livingCostPrediction()

    return housePriceModel #, popuGrowthModel, livingCostModel