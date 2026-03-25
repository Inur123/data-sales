"""
train.py – Train dan evaluasi model klasifikasi status penjualan.

Cara menjalankan (dari root project):
    python ml/train.py

Output:
    ml/model/sales_model.joblib  → model yang disimpan
    ml/model/evaluation.json     → hasil evaluasi
"""

import json
import os
import warnings

import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import (
    accuracy_score,
    classification_report,
    confusion_matrix,
)
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder

warnings.filterwarnings("ignore")

# ---------------------------------------------------------------------------
# Paths
# ---------------------------------------------------------------------------
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_PATH = os.path.join(BASE_DIR, "..", "data", "sales_data.csv")
MODEL_DIR = os.path.join(BASE_DIR, "model")
MODEL_PATH = os.path.join(MODEL_DIR, "sales_model.joblib")
EVAL_PATH = os.path.join(MODEL_DIR, "evaluation.json")

os.makedirs(MODEL_DIR, exist_ok=True)


# ---------------------------------------------------------------------------
# 1. Load data
# ---------------------------------------------------------------------------
def load_data(path: str) -> pd.DataFrame:
    df = pd.read_csv(path)
    print(f"[INFO] Dataset loaded: {len(df)} rows, columns: {list(df.columns)}")
    return df


# ---------------------------------------------------------------------------
# 2. Preprocessing
# ---------------------------------------------------------------------------
def preprocess(df: pd.DataFrame):
    """
    - Drop baris dengan nilai kosong pada kolom fitur / target
    - Encode label target  (Laris → 1, Tidak → 0)
    - Return X (features) dan y (label)
    """
    feature_cols = ["jumlah_penjualan", "harga", "diskon"]
    target_col = "status"

    # Drop missing
    df = df.dropna(subset=feature_cols + [target_col])
    print(f"[INFO] Rows after dropna: {len(df)}")

    # Encode target
    le = LabelEncoder()
    df["label"] = le.fit_transform(df[target_col])  # Laris=0 or 1, depends on sort
    # Normalise: Laris → 1, Tidak → 0
    label_map = {cls: idx for idx, cls in enumerate(le.classes_)}
    print(f"[INFO] Label encoding: {label_map}")

    # Force Laris=1, Tidak=0
    df["label"] = df[target_col].map({"Laris": 1, "Tidak": 0})

    X = df[feature_cols].values
    y = df["label"].values

    print(f"[INFO] Class distribution → Laris: {y.sum()}, Tidak: {(y==0).sum()}")
    return X, y, feature_cols


# ---------------------------------------------------------------------------
# 3. Train
# ---------------------------------------------------------------------------
def train(X_train, y_train) -> RandomForestClassifier:
    model = RandomForestClassifier(
        n_estimators=100,
        max_depth=None,
        random_state=42,
        class_weight="balanced",   # handle class imbalance
    )
    model.fit(X_train, y_train)
    print("[INFO] Model training selesai.")
    return model


# ---------------------------------------------------------------------------
# 4. Evaluate
# ---------------------------------------------------------------------------
def evaluate(model, X_test, y_test, feature_cols) -> dict:
    y_pred = model.predict(X_test)
    acc = accuracy_score(y_test, y_pred)
    report = classification_report(y_test, y_pred, target_names=["Tidak", "Laris"], output_dict=True)
    cm = confusion_matrix(y_test, y_pred).tolist()

    # Feature importances
    importances = {
        col: round(float(imp), 4)
        for col, imp in zip(feature_cols, model.feature_importances_)
    }

    results = {
        "accuracy": round(acc, 4),
        "classification_report": report,
        "confusion_matrix": cm,
        "feature_importances": importances,
    }

    print(f"\n{'='*50}")
    print(f"  Accuracy : {acc:.4f} ({acc*100:.2f}%)")
    print(f"{'='*50}")
    print(classification_report(y_test, y_pred, target_names=["Tidak", "Laris"]))
    print(f"Confusion Matrix:\n{np.array(cm)}")
    print(f"\nFeature Importances:")
    for feat, imp in importances.items():
        print(f"  {feat}: {imp}")
    print(f"{'='*50}\n")

    return results


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------
def main():
    print("\n" + "="*50)
    print("  Mini AI Sales Prediction – Model Training")
    print("="*50 + "\n")

    # Load
    df = load_data(DATA_PATH)

    # Preprocess
    X, y, feature_cols = preprocess(df)

    # Split
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    print(f"[INFO] Train size: {len(X_train)}, Test size: {len(X_test)}")

    # Train
    model = train(X_train, y_train)

    # Evaluate
    results = evaluate(model, X_test, y_test, feature_cols)

    # Save model
    joblib.dump(model, MODEL_PATH)
    print(f"[INFO] Model disimpan ke: {MODEL_PATH}")

    # Save evaluation
    with open(EVAL_PATH, "w") as f:
        json.dump(results, f, indent=2)
    print(f"[INFO] Evaluasi disimpan ke: {EVAL_PATH}")


if __name__ == "__main__":
    main()
