# PriceLens: Smart House Price Estimation

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Visit%20App-blue?style=for-the-badge)](https://price-lens-project.vercel.app/)

## Author

**Olafisoye Emmanuel**  
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Connect-blue?style=flat&logo=linkedin)](https://www.linkedin.com/in/emmanuel-olafisoye/)

## What is PriceLens?

PriceLens is a web application that estimates house prices in Lagos and Abuja, Nigeria. Whether you're looking to rent or buy, simply input your property preferences and get an instant price estimate calibrated to mid-2026 market data.

The Nigerian real estate market can be unpredictable, with prices varying wildly and scams being common. PriceLens provides transparent, data-driven price estimates that help both locals and diaspora citizens make informed decisions.

## The Problem We're Solving

The Nigerian property market has several challenges:
- Inflated and inconsistent pricing across different areas
- Limited transparency in how prices are set
- Difficulty for diaspora citizens to assess fair market rates
- Potential for scams due to information asymmetry

PriceLens addresses these issues by providing objective, market-calibrated price estimates anyone can access for free.

## How It Works

Visit the web app and enter basic property details:
- **Location** — Lagos or Abuja, with 90+ specific towns/areas
- **Bedrooms** (1–10)
- **Bathrooms** (1–10)
- **Toilets** (1–10)
- **Parking Spaces** (0–10)
- **Property Usage** — Rent or Sale
- **Property Type** — Block of Flats, Terraced Bungalow, Semi/Detached Bungalow, Terraced/Semi/Detached Duplex

Hit submit and get an instant estimate with:
- **Rent**: Annual price (per annum) with a monthly equivalent breakdown
- **Sale**: Total asking price for outright purchase
- A price range (±18%) reflecting typical market variation
- Area tier classification and data provenance note

## Pricing Engine

PriceLens uses a market-calibrated pricing engine built from mid-2026 Nigerian real estate listing data (sources: propertypro.ng, nigeriahousingmarket.com, theafricanvestor.com).

### Architecture
- **6 Area Tiers** — from ultra-premium (Ikoyi, Victoria Island, Maitama) to outer/satellite (Epe, Badagry, Gwagwalada)
- **90+ Named Areas** — each mapped to a specific tier across Lagos and Abuja
- **Separate Rent & Sale Tables** — independently calibrated (not derived from each other)
- **Property-Type Multipliers** — Block of Flats (0.80×) up to Detached Duplex (1.70×)
- **Fine-tuning** — minor adjustments for extra bathrooms and parking spaces

### Verified Anchor Points
| Scenario | PriceLens Estimate | Market Range |
|---|---|---|
| 3-bed flat, Yaba, Rent | ~₦400K/month | ₦380K–₦650K/month |
| 3-bed family home, Gwarinpa, Rent | ~₦5M/year | ~₦5M/year |
| 3-bed family home, Kubwa, Rent | ~₦1.75M/year | ~₦1.75M/year |
| 3-bed duplex, Lekki, Sale | ~₦460M | ₦250M–₦500M |

## Technical Details

**Frontend**: HTML, CSS, and vanilla JavaScript — responsive, no framework dependencies  
**Backend**: Python Flask API with Flask-CORS  
**Pricing Engine**: 2026 market-calibrated rule-based system with 6 area tiers, separate rent/sale base-price tables, and property-type multipliers  
**Deployment**: Frontend on Vercel, backend on Render

## Current Limitations

**Geographic scope**: Only covers Lagos and Abuja — other Nigerian cities are not yet supported  
**Static data**: Calibrated to mid-2026 market data; does not update automatically with market shifts  
**Economic factors**: Does not account for rapid inflation, policy changes, or economic events after calibration  
**Property features**: Does not consider property age, exact square footage, amenities, or neighbourhood-level variation within a tier

## What's Next

- Integration with live property listing APIs for real-time price calibration
- Expansion to other Nigerian cities (Port Harcourt, Kano, Ibadan)
- Additional property features (square footage, amenities, neighbourhood ratings)
- Interactive visualizations showing market trends by area and property type

## How to Use

1. **Clone the repository**
   ```bash
   git clone https://github.com/korie-cyber/PriceLens-project.git
   cd PriceLens-project
   ```

2. **Set up your Python environment**
   ```bash
   python -m venv venv
   source venv/bin/activate   # macOS/Linux
   venv\Scripts\activate      # Windows
   pip install -r requirements.txt
   ```

3. **Run the Flask backend**
   ```bash
   cd backend
   flask run
   ```

4. **Launch the frontend** — open `frontend/index.html` in your browser or use a local dev server.

5. Fill in property details and view estimated prices.

## Why We Built This

PriceLens began as our final project during the Data Science and Generative AI internship training at FlexiSAF. We wanted to work on something that actually matters to people's lives, not just another theoretical exercise. The Nigerian housing market affects millions of people every day, and we saw an opportunity to use our newly learned skills to make a difference.

Beyond solving a real problem, this project let us showcase everything we'd learned — data collection, market research, web development, and cloud deployment. We genuinely believe that technology should make life easier and more fair, especially in areas like housing where information gaps can cost people serious money.

## Acknowledgments

Thanks to FlexiSAF for the opportunity to work on this project during our Data Science and Generative AI internship. Special appreciation to my team members and collaborators who contributed their skills and support throughout development.

## Contributing

This is an open project welcoming contributions. Whether you want to improve the pricing engine, add new features, or extend coverage to more cities, we'd love your input.

```bash
git checkout -b feature-branch
git commit -m "Add new feature"
git push origin feature-branch
```

## Disclaimer

PriceLens provides estimates based on market data and should not be the sole factor in property decisions. Always conduct additional research and consult local real estate professionals before making significant financial commitments. Market conditions change rapidly, and our estimates may not reflect the latest pricing.
