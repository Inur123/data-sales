from fastapi import APIRouter, Depends

from app.core.dependencies import get_current_user
from app.schemas.schemas import PredictRequest, PredictResponse
from app.services.predict_service import predict_status

router = APIRouter(prefix="/predict", tags=["Prediction"])


@router.post(
    "",
    response_model=PredictResponse,
    summary="Prediksi status produk (Laris / Tidak)",
    description=(
        "Gunakan fitur `jumlah_penjualan`, `harga`, dan `diskon` "
        "untuk memprediksi apakah suatu produk berstatus **Laris** atau **Tidak**. "
        "Model harus sudah di-train (`python ml/train.py`) sebelum endpoint ini bisa digunakan."
    ),
)
def predict(
    payload: PredictRequest,
    current_user: dict = Depends(get_current_user),
):
    return predict_status(payload)
