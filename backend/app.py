from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import pandas as pd
import os

app = Flask(__name__)
CORS(app)

# ── Location-specific price adjustment factors (2023 → mid-2026) ──────────
#
# The model was trained on 2023 data. These multipliers correct for how much
# each neighbourhood has actually appreciated in naira terms by mid-2026,
# based on publicly available listing data (propertypro.ng, nigeriahousingmarket
# .com, theafricanvestor.com).
#
# Key drivers differentiated per area:
#   • Ultra-premium (Ikoyi, Maitama…) are dollar-linked → large naira uplift
#   • Mid-tier corridor areas track broad inflation (~1.6–1.9×)
#   • Outer/satellite towns are wage-driven → modest appreciation (~1.2–1.4×)
#
LOCATION_ADJUSTMENTS = {
    # ── Lagos ────────────────────────────────────────────────────
    # Ultra-premium — dollar-denominated, strong FX component
    "Ikoyi":                    2.5,
    "Victoria Island (Vi)":     2.5,
    "Lagos Island":             2.2,

    # Premium corridors
    "Lekki":                    2.1,
    "Ibeju Lekki":              1.9,
    "Magodo":                   2.0,

    # Established upper-mid
    "Ikeja":                    1.9,
    "Ajah":                     1.8,
    "Gbagada":                  1.8,
    "Maryland":                 1.8,
    "Isheri North":             1.8,
    "Ogudu":                    1.7,
    "Ojodu":                    1.7,
    "Isheri":                   1.7,

    # Mid-tier residential
    "Yaba":                     1.7,
    "Surulere":                 1.6,
    "Ilupeju":                  1.6,
    "Kosofe":                   1.5,
    "Ketu":                     1.5,
    "Shomolu":                  1.5,
    "Isolo":                    1.5,
    "Oshodi":                   1.5,
    "Amuwo Odofin":             1.5,
    "Ejigbo":                   1.5,
    "Apapa":                    1.5,

    # Affordable / outer Lagos
    "Alimosho":                 1.4,
    "Ipaja":                    1.4,
    "Ayobo":                    1.4,
    "Ifako-Ijaiye":             1.4,
    "Agege":                    1.4,
    "Egbe":                     1.4,
    "Idimu":                    1.4,
    "Orile":                    1.3,
    "Oke-Odo":                  1.3,
    "Ijaiye":                   1.3,
    "Mushin":                   1.3,
    "Ikorodu":                  1.3,
    "Ibeju":                    1.3,
    "Ijede":                    1.2,
    "Epe":                      1.2,
    "Badagry":                  1.2,
    "Agbara-Igbesa":            1.2,

    # ── Abuja ────────────────────────────────────────────────────
    # Ultra-premium — diplomatic/government demand, limited land
    "Maitama District":         2.5,
    "Asokoro District":         2.5,
    "Diplomatic Zones":         2.3,
    "Central Business District": 2.2,

    # Premium
    "Wuse 2":                   2.2,
    "Jabi":                     2.1,
    "Mabushi":                  2.0,
    "Gudu":                     2.0,

    # Upper mid
    "Katampe":                  2.0,
    "Guzape District":          2.0,
    "Utako":                    1.9,
    "Wuye":                     1.9,
    "Life Camp":                1.9,
    "Jahi":                     1.9,
    "Apo":                      1.8,
    "Garki":                    1.8,
    "Wuse":                     1.8,
    "Gaduwa":                   1.8,
    "Kaura":                    1.8,

    # Mid
    "Dape":                     1.7,
    "Kafe":                     1.7,
    "Gwarinpa":                 1.7,
    "Galadimawa":               1.7,
    "Dakwo":                    1.6,
    "Karu":                     1.6,
    "Kukwaba":                  1.6,
    "Mbora (Nbora)":            1.6,
    "Dakibiyu":                 1.6,
    "Karsana":                  1.5,
    "Karmo":                    1.5,
    "Kurudu":                   1.5,
    "Idu Industrial":           1.5,
    "Kyami":                    1.5,

    # Affordable / satellite towns
    "Kubwa":                    1.4,
    "Lugbe District":           1.4,
    "Lokogoma District":        1.4,
    "Mpape":                    1.3,
    "Karshi":                   1.3,
    "Kuje":                     1.3,
    "Orozo":                    1.3,
    "Bwari":                    1.2,
    "Gwagwalada":               1.2,
    "Kagini":                   1.2,
    "Kabusa":                   1.2,
    "Dei-Dei":                  1.2,
    "Duboyi":                   1.2,
    "Wumba":                    1.2,
    "Mararaba":                 1.2,
}

# Fallback for any town not in the map above
DEFAULT_ADJUSTMENT = 1.6

# Rents track local wages more than capital values track FX.
# Empirically rents in NG rose ~1.5–1.8× while sale prices rose ~1.8–2.5×.
# Apply a moderate downward correction for rental listings.
RENT_MODIFIER = 0.88


def get_price_adjustment(town, listing_type):
    factor = LOCATION_ADJUSTMENTS.get(town, DEFAULT_ADJUSTMENT)
    if listing_type and listing_type.lower() == 'rent':
        factor = max(factor * RENT_MODIFIER, 1.2)
    return factor


# ── Model loading ──────────────────────────────────────────────────────────

model = None
metadata = None


def _find_candidate_path(name):
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
    global model, metadata
    if model is not None and metadata is not None:
        return

    model_names = [
        'pricelens_gradient_boosting_model.pkl',
        'best_gradient_boosting_model.pkl',
        'pricelens_model.pkl',
    ]
    metadata_names = ['model_metadata.pkl', 'metadata.pkl', 'pricelens_metadata.pkl']

    for mn in model_names:
        p = _find_candidate_path(mn)
        if p:
            try:
                model = joblib.load(p)
                print(f"✅ Model loaded from {p}")
                break
            except Exception as e:
                print(f"❌ Error loading model from {p}: {e}")

    for md in metadata_names:
        p = _find_candidate_path(md)
        if p:
            try:
                metadata = joblib.load(p)
                print(f"✅ Metadata loaded from {p}")
                break
            except Exception as e:
                print(f"❌ Error loading metadata from {p}: {e}")

    if metadata is None:
        print("⚠️  No metadata file found — using default feature order.")

    print(f"Status — Model: {'✅' if model else '❌'}, Metadata: {'✅' if metadata else '⚠️ missing'}")


load_model_and_metadata()


# ── Helpers ────────────────────────────────────────────────────────────────

def nv(v):
    return v if v is not None else ""


def map_form_to_model_input(data):
    return {
        'bedrooms':     data.get('bedroom'),
        'bathrooms':    data.get('bathroom'),
        'toilets':      data.get('toilet'),
        'parking_space': data.get('parkingSpace'),
        'title':        data.get('type'),
        'town':         data.get('town'),
        'state':        data.get('state'),
        'listing_type': data.get('usage'),
    }


# ── Routes ─────────────────────────────────────────────────────────────────

@app.route('/estimate', methods=['POST', 'OPTIONS'])
def estimate():
    if request.method == 'OPTIONS':
        return ('', 204)

    if model is None:
        load_model_and_metadata()
        if model is None:
            return jsonify({'error': 'Model not loaded. Please check server logs.'}), 500

    data = request.get_json(force=True, silent=True)
    if not data:
        return jsonify({'error': 'Invalid JSON body.'}), 400

    try:
        model_input = map_form_to_model_input(data)

        required_fields = ['bedrooms', 'bathrooms', 'toilets', 'parking_space',
                           'title', 'town', 'state', 'listing_type']
        missing = [f for f in required_fields if model_input.get(f) is None]
        if missing:
            return jsonify({'error': f'Missing required fields: {", ".join(missing)}'}), 400

        df = pd.DataFrame([model_input])
        if metadata and 'feature_order' in metadata:
            df = df[metadata['feature_order']]
        else:
            df = df.reindex(required_fields, axis=1)

        raw_prediction = model.predict(df)[0]

        # Apply location- and listing-type-specific adjustment
        town = data.get('town', '')
        listing_type = data.get('usage', 'Sale')
        adjustment = get_price_adjustment(town, listing_type)
        prediction = raw_prediction * adjustment

        # ±18% price band — reflects genuine market variability
        price_low  = round(prediction * 0.82)
        price_high = round(prediction * 1.18)

        address = ''
        if data.get('town'):
            address += str(data['town'])
        if data.get('state'):
            address += (', ' if data.get('town') else '') + str(data['state'])

        description = (
            f"A {nv(data.get('bedroom'))}-bedroom, {nv(data.get('bathroom'))}-bathroom "
            f"{nv(data.get('type'))} located in {address or 'N/A'}, "
            f"suitable for {nv(data.get('usage')).lower()} use."
        )

        tier = _area_tier(town)

        resp = {
            'type':                  nv(data.get('type')),
            'state':                 nv(data.get('state')),
            'town':                  nv(data.get('town')),
            'address':               address or 'N/A',
            'price':                 round(prediction, 2),
            'price_low':             price_low,
            'price_high':            price_high,
            'price_formatted':       f"NGN {prediction:,.0f}",
            'price_range_formatted': f"NGN {price_low:,} – NGN {price_high:,}",
            'description':           description,
            'model_used':            'Gradient Boosting Model',
            'area_tier':             tier,
            'data_note':             (
                f"Price adjusted for {town} market conditions "
                f"({adjustment:.1f}× factor, {tier} area). "
                "Based on 2023 model data calibrated to mid-2026 Nigerian real estate prices."
            ),
        }

        return jsonify(resp), 200

    except Exception as e:
        print(f"Prediction error: {e}")
        return jsonify({'error': 'Error making prediction. Please check your input data.'}), 500


def _area_tier(town):
    """Return a human-readable tier label for the area."""
    factor = LOCATION_ADJUSTMENTS.get(town, DEFAULT_ADJUSTMENT)
    if factor >= 2.2:
        return "ultra-premium"
    if factor >= 1.9:
        return "premium"
    if factor >= 1.6:
        return "mid-tier"
    if factor >= 1.4:
        return "affordable"
    return "outer / satellite"


@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'healthy',
        'model_status': 'loaded' if model else 'not loaded',
        'metadata_status': 'loaded' if metadata else 'not loaded',
    }), 200


@app.route('/model-info', methods=['GET'])
def model_info():
    if model is None:
        return jsonify({'error': 'Model not loaded'}), 500

    info = {
        'model_type': 'Gradient Boosting',
        'model_loaded': True,
        'metadata_loaded': metadata is not None,
        'location_adjustments': LOCATION_ADJUSTMENTS,
        'default_adjustment': DEFAULT_ADJUSTMENT,
    }

    if metadata:
        info['feature_order'] = metadata.get('feature_order', [])
    else:
        info['feature_order'] = [
            'bedrooms', 'bathrooms', 'toilets', 'parking_space',
            'title', 'town', 'state', 'listing_type',
        ]

    return jsonify(info), 200


if __name__ == '__main__':
    port = int(os.environ.get('PORT', 8080))
    app.run(host='0.0.0.0', port=port, debug=True)
