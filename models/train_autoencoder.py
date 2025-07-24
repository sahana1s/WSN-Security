import os
import numpy as np
import pandas as pd
import joblib
from tensorflow.keras.models import Model
from tensorflow.keras.layers import Input, Dense
from tensorflow.keras.optimizers import Adam
from tensorflow.keras.losses import MeanSquaredError

# Ensure the models directory exists
os.makedirs("models", exist_ok=True)

# 1. Generate realistic training data
def generate_data(n=1000):
    return pd.DataFrame({
        "Temperature": np.random.uniform(15, 45, n),   # Wider temp range
        "Humidity":    np.random.uniform(20, 90, n),   # More variance
        "Pressure":    np.random.uniform(900, 1100, n) # Edge cases included
    })

# 2. Build simple autoencoder
def build_autoencoder(input_dim):
    inp = Input(shape=(input_dim,))
    encoded = Dense(8, activation='relu')(inp)
    decoded = Dense(input_dim, activation='linear')(encoded)
    return Model(inputs=inp, outputs=decoded)

# 3. Train model
df = generate_data()
X = df.to_numpy()

model = build_autoencoder(X.shape[1])
model.compile(optimizer=Adam(1e-3), loss=MeanSquaredError())
model.fit(X, X, epochs=50, batch_size=32, shuffle=True, validation_split=0.1)

# 4. Evaluate reconstruction errors
recon = model.predict(X, verbose=0)
mse = np.mean(np.square(X - recon), axis=1)
threshold = np.percentile(mse, 99)  # More lenient than 95

print("📊 Training Summary:")
print(f"- Mean MSE: {np.mean(mse):.6f}")
print(f"- Max MSE : {np.max(mse):.6f}")
print(f"- Threshold (99th percentile): {threshold:.6f}")

# 5. Save model + threshold
model.save("models/autoencoder_model.keras")
joblib.dump(threshold, "models/reconstruction_threshold.pkl")

print("✅ Model and threshold saved successfully.")
