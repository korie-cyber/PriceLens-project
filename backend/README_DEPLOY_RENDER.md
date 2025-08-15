# PriceLens Backend — Render Deployment Guide (Java)

## Files included
- `Estimate.java` — request model
- `EstimateHandler.java` — HTTP handler, CORS, JSON in/out
- `EstimateServer.java` — starts server and binds to `PORT` (Render) or 8080 (local)
- `manifest.txt` — JAR manifest (Main-Class and classpath for gson)
- `Procfile` — starts the app with `java -jar PriceLensBackend.jar`
- `build.sh` / `build.bat` — helper scripts to build locally or on Render

## Requirements
- `gson-2.8.9.jar` must exist in the same folder (commit this jar in your repo).
- Java 11+

## Local build & run (Windows)
```bat
build.bat
java -jar PriceLensBackend.jar
```

## Local build & run (Linux/Mac)
```bash
chmod +x build.sh
./build.sh
java -jar PriceLensBackend.jar
```

## Render Settings
- **Build Command:**
  ```bash
  ./build.sh
  ```
  (or paste these two lines:)
  ```bash
  javac -cp gson-2.8.9.jar:. *.java -d out
  jar cfm PriceLensBackend.jar manifest.txt -C out .
  ```
- **Start Command:**
  ```
  java -jar PriceLensBackend.jar
  ```

When deployed, Render will give you a URL like:
`https://<your-service>.onrender.com/estimate`

## Frontend
In your `script.js`:
```js
fetch("https://<your-service>.onrender.com/estimate", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(data),
})
```
