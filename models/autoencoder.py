
from keras.models import load_model
import joblib
import numpy as np
import pandas as pd

model = load_model("models/autoencoder_model.keras")
threshold = joblib.load("models/reconstruction_threshold.pkl")
scaler = joblib.load("models/scaler.pkl")

def is_anomaly(data_point):
    columns = ['temperature', 'humidity', 'pressure']
    X_df = pd.DataFrame([data_point], columns=columns)
    X = scaler.transform(X_df)
    recon = model.predict(X, verbose=0)
    mse = np.mean(np.square(X - recon))
    return mse > threshold
