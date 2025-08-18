from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import pandas as pd
import os

app = Flask(__name__)
CORS(app)

# Model and metadata globals
model = None
metadata = None


def _find_candidate_path(name):
    """Return the first existing path for a candidate filename."""
    candidates = [
        name,
        os.path.join(os.path.dirname(__file__), name),
        os.path.join(os.getcwd(), name),
        os.path.join(os.path.dirname(__file__), '..', 'data-science', name),
        os.path.join(os.getcwd(), '..', 'data-science', name),
    ]
    for c in candidates:
        p = os.path.abspath(c)
        if os.path.exists(p):
            return p
    return None


def load_model_and_metadata():
    """Attempt to load model and metadata from several likely locations.

    This function is safe to call multiple times and will set the module
    globals `model` and `metadata`.
    """
    global model, metadata
    # If already loaded, nothing to do
    if model is not None and metadata is not None:
        return

    # Try model names 
    model_names = [
        'pricelens_gradient_boosting_model.pkl',
        'best_gradient_boosting_model.pkl',
        'pricelens_model.pkl',
    ]
    metadata_names = ['model_metadata.pkl', 'metadata.pkl', 'pricelens_metadata.pkl']

    # Load model
    for mn in model_names:
        p = _find_candidate_path(mn)
        if p:
            try:
                model = joblib.load(p)
                print(f"✅ Model loaded successfully from {p}!")
                break
            except Exception as e:
                print(f"❌ Error loading model from {p}: {e}")

    # Load metadata
    for md in metadata_names:
        p = _find_candidate_path(md)
        if p:
            try:
                metadata = joblib.load(p)
                print(f"✅ Metadata loaded successfully from {p}!")
                break
            except Exception as e:
                print(f"❌ Error loading metadata from {p}: {e}")

    if metadata is None:
        print("⚠️  No metadata file found. Will work without feature ordering.")

    print(f"Final status - Model: {'✅ Loaded' if model else '❌ Failed'}, Metadata: {'✅ Loaded' if metadata else '⚠️  Missing'}")


# Try loading at import time (safe; will also be attempted per-request)
load_model_and_metadata()


def nv(v):
    """Return value if not None, otherwise return empty string for display"""
    return v if v is not None else ""


def map_form_to_model_input(data):
    """Map form field names to model input format"""
    return {
        'bedrooms': data.get('bedroom'),  # Form uses 'bedroom', model expects 'bedrooms'
        'bathrooms': data.get('bathroom'),  # Form uses 'bathroom', model expects 'bathrooms'
        'toilets': data.get('toilet'),  # Form uses 'toilet', model expects 'toilets'
        'parking_space': data.get('parkingSpace'),  # Form uses 'parkingSpace', model expects 'parking_space'
        'title': data.get('type'),  # Form uses 'type', model expects 'title'
        'town': data.get('town'),
        'state': data.get('state'),
        'listing_type': data.get('usage')  # Form uses 'usage', model expects 'listing_type'
    }


@app.route('/estimate', methods=['POST', 'OPTIONS'])
def estimate():
    if request.method == 'OPTIONS':
        return ('', 204)

    # Check if model is loaded
    # Ensure model is loaded in this process (handles worker/child processes)
    if model is None:
        load_model_and_metadata()
        if model is None:
            return jsonify({'error': 'Model not loaded. Please check server logs.'}), 500

    data = request.get_json(force=True, silent=True)
    if not data:
        return jsonify({'error': 'Invalid JSON body.'}), 400

    try:
        # Map form data to model input format
        model_input = map_form_to_model_input(data)
        
        # Validate required fields
        required_fields = ['bedrooms', 'bathrooms', 'toilets', 'parking_space', 'title', 'town', 'state', 'listing_type']
        missing_fields = [field for field in required_fields if model_input.get(field) is None]
        
        if missing_fields:
            return jsonify({'error': f'Missing required fields: {", ".join(missing_fields)}'}), 400

        # Convert to DataFrame with correct column order
        df = pd.DataFrame([model_input])
        
        # Use feature order if available, otherwise use default order
        if metadata and 'feature_order' in metadata:
            df = df[metadata['feature_order']]  # Ensure correct order as per model training
        else:
            # Use a reasonable default order if no metadata
            expected_columns = ['bedrooms', 'bathrooms', 'toilets', 'parking_space', 'title', 'town', 'state', 'listing_type']
            df = df.reindex(expected_columns, axis=1)
        
        # Make prediction
        prediction = model.predict(df)[0]
        
        # Format address
        address = ''
        if data.get('town'):
            address += str(data.get('town'))
        if data.get('state'):
            address += (', ' if data.get('town') else '') + str(data.get('state'))

        # Generate description
        description = (
            f"A {nv(data.get('bedroom'))}-bedroom, {nv(data.get('bathroom'))}-bathroom "
            f"{nv(data.get('type'))} located in {address or 'N/A'}, "
            f"suitable for {nv(data.get('usage')).lower()} use."
        )

        # Prepare response
        resp = {
            'type': nv(data.get('type')),
            'state': nv(data.get('state')),
            'town': nv(data.get('town')),
            'address': address or 'N/A',
            'price': round(prediction, 2),  # Round to 2 decimal places
            'price_formatted': f"NGN {prediction:,.2f}",  # Formatted price
            'description': description,
            'model_used': 'Gradient Boosting Model'
        }

        return jsonify(resp), 200

    except Exception as e:
        print(f"Prediction error: {e}")
        return jsonify({'error': 'Error making prediction. Please check your input data.'}), 500


@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    model_status = "loaded" if model is not None else "not loaded"
    metadata_status = "loaded" if metadata is not None else "not loaded"
    
    return jsonify({
        'status': 'healthy',
        'model_status': model_status,
        'metadata_status': metadata_status
    }), 200


@app.route('/model-info', methods=['GET'])
def model_info():
    """Get information about the loaded model"""
    if model is None:
        return jsonify({'error': 'Model not loaded'}), 500
    
    info = {
        'model_type': 'Gradient Boosting',
        'model_loaded': True,
        'metadata_loaded': metadata is not None
    }
    
    if metadata:
        info.update({
            'feature_order': metadata.get('feature_order', []),
            'features_count': len(metadata.get('feature_order', []))
        })
    else:
        info.update({
            'feature_order': ['bedrooms', 'bathrooms', 'toilets', 'parking_space', 'title', 'town', 'state', 'listing_type'],
            'features_count': 8,
            'note': 'Using default feature order (no metadata file found)'
        })
    
    return jsonify(info), 200


if __name__ == '__main__':
    port = int(os.environ.get('PORT', 8080))
    app.run(host='0.0.0.0', port=port, debug=True)