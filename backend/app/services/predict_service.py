import os
import joblib
import numpy as np
from fastapi import HTTPException, status

from app.core.config import settings
from app.schemas.schemas import PredictRequest, PredictResponse


def _load_model():
    """Resolve model path relative to this file and load it."""
    model_path = os.path.abspath(
        os.path.join(os.path.dirname(__file__), "..", "..", settings.MODEL_PATH)
    )
    if not os.path.exists(model_path):
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=(
                "Model belum di-train. "
                "Jalankan `python ml/train.py` terlebih dahulu."
            ),
        )
    try:
        return joblib.load(model_path)
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Gagal memuat model: {exc}",
        )


def predict_status(payload: PredictRequest) -> PredictResponse:
    """Run the trained model and return prediction + probabilities."""
    model = _load_model()

    features = np.array([[payload.jumlah_penjualan, payload.harga, payload.diskon]])

    try:
        prediction = model.predict(features)[0]          # 0 = Tidak, 1 = Laris
        probabilities = model.predict_proba(features)[0]  # [prob_tidak, prob_laris]
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Prediction error: {exc}",
        )

    label_map = {0: "Tidak", 1: "Laris"}
    status_prediksi = label_map.get(int(prediction), str(prediction))

    # Guard: some models may not support predict_proba
    prob_laris = float(probabilities[1]) if len(probabilities) > 1 else float(prediction)
    prob_tidak = float(probabilities[0]) if len(probabilities) > 1 else 1 - prob_laris

    return PredictResponse(
        status_prediksi=status_prediksi,
        probabilitas_laris=round(prob_laris, 4),
        probabilitas_tidak=round(prob_tidak, 4),
        input_data=payload,
    )
