import sys
import json
import random

# In a real scenario, this would load a trained model and predict based on input
def predict_attendance(data):
    try:
        # Mock prediction logic
        student_id = data.get('studentId')
        current_attendance = data.get('currentAttendance', 0)
        
        # Simple logic: slightly random variation of current attendance
        # If attendance is high, prediction stays high. If low, it might drop further.
        variation = random.uniform(-5, 5)
        prediction = min(100, max(0, current_attendance + variation))
        
        confidence = random.uniform(0.8, 0.99)
        
        result = {
            "studentId": student_id,
            "predictedAttendance": round(prediction, 2),
            "confidence": round(confidence, 2),
            "riskLevel": "High" if prediction < 75 else "Low",
            "message": "Prediction based on current trends."
        }
        
        return result
    except Exception as e:
        return {"error": str(e)}

if __name__ == "__main__":
    # Read input from stdin
    try:
        input_data = sys.stdin.read()
        if not input_data:
            print(json.dumps({"error": "No input data provided"}))
            sys.exit(1)
            
        data = json.loads(input_data)
        result = predict_attendance(data)
        
        # Print result to stdout
        print(json.dumps(result))
    except Exception as e:
        print(json.dumps({"error": str(e)}))
        sys.exit(1)
