# PriceLens Backend — Render Deployment Guide

Python Flask app serving the 2026 market-calibrated pricing engine.

Files in this folder:

- `app.py` — Flask app exposing POST `/estimate` and GET `/health`, `/model-info`.
- `requirements.txt` — Python dependencies: Flask, gunicorn, flask-cors.
- `Procfile` — start command: `gunicorn app:app --bind 0.0.0.0:$PORT --workers 1`.

Deploy on Render (step-by-step):

1. Push the repository to your Git host (GitHub/GitLab/Bitbucket).
2. In Render, create a new Web Service and connect the repository.
3. Set the Root Directory to `backend`.
4. Build Command: `pip install -r requirements.txt`
5. Start Command: Render uses the `Procfile` automatically; otherwise set:
   `gunicorn app:app --bind 0.0.0.0:$PORT --workers 1`
6. Health check path: `/health`.

Local testing:

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python app.py
```

Test the endpoint:

```powershell
$body = @{ bedroom="3"; bathroom="2"; toilet="2"; parkingSpace="1"; town="Yaba"; state="Lagos"; type="Block of Flats"; usage="Rent" } | ConvertTo-Json
Invoke-RestMethod -Uri "http://localhost:8080/estimate" -Method Post -Body $body -ContentType "application/json"
```
