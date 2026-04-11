from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
import joblib
import os
import json
import pandas as pd

app = FastAPI(title="Predictive Maintenance ML API", description="API to predict machine failures", version="1.0.0")

# Load model globally
MODEL_PATH = 'model.pkl'
if os.path.exists(MODEL_PATH):
    model = joblib.load(MODEL_PATH)
    print("Model loaded successfully.")
else:
    model = None
    print("Warning: model.pkl not found. Please train the model first.")

class PredictionRequest(BaseModel):
    air_temperature: float = Field(..., description="Air temperature [K]")
    process_temperature: float = Field(..., description="Process temperature [K]")
    rotational_speed: float = Field(..., description="Rotational speed [rpm]")
    torque: float = Field(..., description="Torque [Nm]")
    tool_wear: float = Field(..., description="Tool wear [min]")

@app.get("/health")
def health_check():
    """Returns service status."""
    return {"status": "ok", "model_loaded": model is not None}

@app.post("/predict")
def predict(request: PredictionRequest):
    """Predicts if the machine will fail based on the input parameters."""
    if model is None:
        raise HTTPException(status_code=500, detail="ML model is not loaded. Train the model first.")
    
    # Construct DataFrame to resolve Scikit-learn Feature Name warnings
    input_df = pd.DataFrame([{
        'Air temperature [K]': request.air_temperature,
        'Process temperature [K]': request.process_temperature,
        'Rotational speed [rpm]': request.rotational_speed,
        'Torque [Nm]': request.torque,
        'Tool wear [min]': request.tool_wear
    }])
    
    # Perform prediction
    try:
        prediction = model.predict(input_df)[0]
        if hasattr(model, "predict_proba"):
            probabilities = model.predict_proba(input_df)[0]
            confidence = probabilities[prediction]
        else:
            confidence = 1.0 
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error performing prediction: {str(e)}")

    prediction_int = int(prediction)

    # Prepare logic based on prediction
    if prediction_int == 0:
        status = "Normal"
        suggestion = "Machine is operating normally. Continue regular monitoring."
    else:
        status = "Failure Risk"
        suggestion = "Potential machine failure detected. Perform inspection and preventive maintenance."

    return {
        "prediction": prediction_int,
        "status": status,
        "confidence": round(float(confidence), 4),
        "suggestion": suggestion
    }
