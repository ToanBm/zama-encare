#!/usr/bin/env python3
"""
ML Inference using trained Concrete ML model
Load model từ zama_healthshield/server/ và run prediction
"""

import sys
import os
import numpy as np
from concrete.ml.deployment import FHEModelServer, FHEModelClient

# Path to trained model (local to backend)
MODEL_PATH = os.path.join(os.path.dirname(__file__), "..", "ml", "server")

def calculate_bmi(weight_kg, height_cm):
    """Calculate BMI from weight and height"""
    height_m = height_cm / 100.0
    bmi = weight_kg / (height_m ** 2)
    return round(bmi, 1)

def predict_health_risk(weight_kg, height_cm, exercise_level, diet_score, age=30):
    """
    Predict health risk using trained Concrete ML model
    
    Args:
        weight_kg: Weight in kilograms (float)
        height_cm: Height in centimeters (float)
        exercise_level: Activity level 1-5 (int)
        diet_score: Diet quality 1-10 (int)
        age: Age in years (int, default 30)
    
    Returns:
        risk_level: 0=low, 1=medium, 2=high
    """
    
    # Calculate BMI
    bmi = calculate_bmi(weight_kg, height_cm)
    
    # Prepare input features: [BMI, activity, diet, age]
    X = np.array([[bmi, exercise_level, diet_score, age]])
    
    print(f"📊 Input features:")
    print(f"   BMI: {bmi}")
    print(f"   Activity: {exercise_level}/5")
    print(f"   Diet: {diet_score}/10")
    print(f"   Age: {age}")
    
    # Load FHE model
    print(f"\n🔐 Loading FHE model from: {MODEL_PATH}")
    server = FHEModelServer(MODEL_PATH)
    server.load()
    print("✅ Model loaded")
    
    # Load client for encryption
    client = FHEModelClient(MODEL_PATH)
    client.generate_private_and_evaluation_keys()
    evaluation_keys = client.get_serialized_evaluation_keys()
    
    # Encrypt input
    print("🔒 Encrypting input...")
    encrypted_input = client.quantize_encrypt_serialize(X)
    
    # Run FHE inference
    print("🧠 Running FHE inference...")
    encrypted_output = server.run(encrypted_input, evaluation_keys)
    
    # Decrypt result
    print("🔓 Decrypting result...")
    result = client.deserialize_decrypt_dequantize(encrypted_output)
    
    # Get predicted class (risk level)
    risk_level = int(np.argmax(result[0]))
    risk_labels = ["Low", "Medium", "High"]
    
    print(f"\n📈 Prediction:")
    print(f"   Probabilities: {result[0]}")
    print(f"   Risk Level: {risk_level} ({risk_labels[risk_level]})")
    
    return risk_level

if __name__ == "__main__":
    # Parse command line arguments
    if len(sys.argv) < 5:
        print("Usage: python ml_inference.py <weight_kg> <height_cm> <exercise> <diet> [age]")
        print("\nExample:")
        print("  python ml_inference.py 70.5 175 3 7 30")
        print("\nParameters:")
        print("  weight_kg: Weight in kg (e.g., 70.5)")
        print("  height_cm: Height in cm (e.g., 175)")
        print("  exercise: Activity level 1-5 (e.g., 3)")
        print("  diet: Diet score 1-10 (e.g., 7)")
        print("  age: Age in years (optional, default 30)")
        sys.exit(1)
    
    # Parse inputs
    weight = float(sys.argv[1])
    height = float(sys.argv[2])
    exercise = int(sys.argv[3])
    diet = int(sys.argv[4])
    age = int(sys.argv[5]) if len(sys.argv) > 5 else 30
    
    # Validate inputs
    if weight <= 0 or weight > 300:
        print("❌ Weight must be between 1-300 kg")
        sys.exit(1)
    
    if height <= 0 or height > 300:
        print("❌ Height must be between 1-300 cm")
        sys.exit(1)
    
    if exercise < 1 or exercise > 5:
        print("❌ Exercise level must be 1-5")
        sys.exit(1)
    
    if diet < 1 or diet > 10:
        print("❌ Diet score must be 1-10")
        sys.exit(1)
    
    print("=" * 70)
    print("🏥 ZamaHealth - ML Inference with Concrete ML")
    print("=" * 70)
    
    try:
        # Run prediction
        risk = predict_health_risk(weight, height, exercise, diet, age)
        
        print("\n" + "=" * 70)
        print(f"✅ Prediction complete: Risk = {risk}")
        print("=" * 70)
        
        # Output risk level for script parsing
        print(f"\nRISK_LEVEL={risk}")
        
    except Exception as e:
        print(f"\n❌ Error during inference: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

