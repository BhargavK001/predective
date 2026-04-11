# IoT-Based Predictive Maintenance System - Backend & ML

This project contains the Machine Learning Service and Node.js Backend for predicting industrial machine failures using the AI4I 2020 Predictive Maintenance Dataset.

## Project Structure
```
project-root/
  backend/           # Node.js + Express API Backend
  ml-service/        # Python FastAPI + scikit-learn ML Service
  README.md          # Project Instructions
```

## Setup Instructions

### 1. Dataset Placement
1. Download the `ai4i2020.csv` dataset.
2. Place the file inside the `ml-service/data` folder (create `data/` if it does not exist).
   Example path: `ml-service/data/ai4i2020.csv`

---

### 2. Machine Learning Service (Python)

**Prerequisites:** Python 3.8+ 

**Installation:**
```bash
cd ml-service
pip install -r requirements.txt
```

**Train the Model:**
You must train the model *before* starting the API server!
```bash
cd ml-service
python train_model.py
```
This will:
- Load the dataset.
- Train Logistic Regression, Decision Tree, and Random Forest models.
- Choose the most accurate model.
- Save `model.pkl` and `metrics.json`.

**Run the Python ML Service:**
```bash
cd ml-service
uvicorn main:app --host 127.0.0.1 --port 8000 --reload
```

---

### 3. Backend Service (Node.js)

**Prerequisites:** Node.js 16+

**Installation:**
```bash
cd backend
npm install
```

**Run the Backend Server:**
```bash
cd backend
npm run dev
# or
node server.js
```
The node backend runs on `http://localhost:5000` (or the port specified in `.env`).

---

## API Testing using Postman or cURL

### 1. Check Health
```bash
curl http://localhost:5000/api/health
```

### 2. Predict Machine Failure
Send a POST request with the sensor features.
```bash
curl -X POST http://localhost:5000/api/predict \
     -H "Content-Type: application/json" \
     -d '{
           "air_temperature": 300,
           "process_temperature": 310,
           "rotational_speed": 1500,
           "torque": 40,
           "tool_wear": 120
         }'
```
**Expected Response:**
```json
{
  "prediction": 0,
  "status": "Normal",
  "confidence": 0.93,
  "suggestion": "Machine is operating normally. Continue regular monitoring."
}
```

### 3. View ML Metrics
```bash
curl http://localhost:5000/api/metrics
```

### 4. View Prediction History
```bash
curl http://localhost:5000/api/history
```

---

### 4. Frontend Dashboard (React + Tailwind)

**Prerequisites:** Node.js 16+

**Installation:**
```bash
cd frontend
npm install
```

*(Note: TailwindCSS and React-Router-DOM are already perfectly configured!)*

**Run the Frontend Development Server:**
```bash
cd frontend
npm run dev
```

That's it! Open the generated `http://localhost:5173` link in your browser to access the beautiful React dashboard. The frontend automatically connects to the backend running on `http://localhost:5000`.
