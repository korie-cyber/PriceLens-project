
# Backend Usage Example
import joblib
import pandas as pd

# Load model and metadata
model = joblib.load('best_gradient_boosting_model.pkl')
metadata = joblib.load('model_metadata.pkl')

# Create input DataFrame (MUST follow exact order)
input_data = {
    'bedrooms': 3,
    'bathrooms': 2,
    'toilets': 3,
    'parking_space': 2,
    'title': 'Detached Duplex',
    'town': 'Lekki',
    'state': 'Lagos',
    'listing_type': 'Sale'
}

# Convert to DataFrame with correct column order
df = pd.DataFrame([input_data])
df = df[metadata['feature_order']]  # Ensure correct order

# Make prediction
prediction = model.predict(df)[0]
print(f"Predicted Price: NGN {prediction:,.2f}")
