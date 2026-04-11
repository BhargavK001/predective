import pandas as pd
import numpy as np
import os
import json
import joblib
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, classification_report, confusion_matrix

def main():
    print("Starting ML Model Training Process...")
    
    # 1. Dataset loading
    # We use an absolute path relative to this script so it works from anywhere
    base_dir = os.path.dirname(os.path.abspath(__file__))
    dataset_path = os.path.join(base_dir, 'data', 'ai4i2020.csv')
    
    if not os.path.exists(dataset_path):
        print(f"Dataset not found at {dataset_path}. Please place 'ai4i2020.csv' in the 'data' folder.")
        # Ensure 'data' directory exists
        os.makedirs('data', exist_ok=True)
        return

    print("Loading dataset...")
    df = pd.read_csv(dataset_path)

    # 2. Data preprocessing
    # Features to use: Air temperature [K], Process temperature [K], Rotational speed [rpm], Torque [Nm], Tool wear [min]
    feature_cols = [
        'Air temperature [K]', 
        'Process temperature [K]', 
        'Rotational speed [rpm]', 
        'Torque [Nm]', 
        'Tool wear [min]'
    ]
    
    target_col = 'Machine failure'
    
    # Check if all required columns exist
    missing_cols = [col for col in feature_cols + [target_col] if col not in df.columns]
    if missing_cols:
        print(f"Error: Missing columns in dataset: {missing_cols}")
        return
        
    X = df[feature_cols]
    y = df[target_col]
    
    # 3. Train-test split
    print("Splitting dataset into train and test sets...")
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    # 4. Training of models
    models = {
        'Logistic Regression': LogisticRegression(max_iter=1000, random_state=42),
        'Decision Tree Classifier': DecisionTreeClassifier(random_state=42),
        'Random Forest Classifier': RandomForestClassifier(n_estimators=100, random_state=42)
    }
    
    trained_models = {}
    metrics = {}
    best_model_name = ""
    best_accuracy = 0.0
    
    print("Training models...")
    for name, model in models.items():
        print(f"Training {name}...")
        model.fit(X_train, y_train)
        
        # 5. Evaluation of each model
        y_pred = model.predict(X_test)
        
        acc = accuracy_score(y_test, y_pred)
        prec = precision_score(y_test, y_pred, zero_division=0)
        rec = recall_score(y_test, y_pred, zero_division=0)
        f1 = f1_score(y_test, y_pred, zero_division=0)
        
        # 6. Generate classification report
        cls_report = classification_report(y_test, y_pred, output_dict=True, zero_division=0)
        
        # 7. Generate confusion matrix
        cm = confusion_matrix(y_test, y_pred)
        
        metrics[name] = {
            'Accuracy': acc,
            'Precision': prec,
            'Recall': rec,
            'F1-score': f1,
            'Classification_Report': cls_report,
            'Confusion_Matrix': cm.tolist()
        }
        
        # 11. Include feature importance output if Random Forest
        if name == 'Random Forest Classifier':
            importances = model.feature_importances_
            feature_imp = {feat: float(imp) for feat, imp in zip(feature_cols, importances)}
            metrics[name]['Feature_Importance'] = feature_imp
        
        trained_models[name] = model
        
        # 8. Automatically select the best model based on accuracy
        if acc > best_accuracy:
            best_accuracy = acc
            best_model_name = name
            
    print(f"\nBest Model Selected: {best_model_name} with Accuracy: {best_accuracy:.4f}")
    
    # 9. Save the best model as model.pkl
    best_model = trained_models[best_model_name]
    print(f"Saving best model to 'model.pkl'...")
    joblib.dump(best_model, 'model.pkl')
    
    # 10. Save evaluation metrics into metrics.json
    final_metrics_output = {
        'Best_Model': best_model_name,
        'Best_Accuracy': best_accuracy,
        'All_Models_Metrics': metrics
    }
    
    print("Saving metrics to 'metrics.json'...")
    with open('metrics.json', 'w') as f:
        json.dump(final_metrics_output, f, indent=4)
        
    print("Training process completed successfully.")

if __name__ == '__main__':
    main()
