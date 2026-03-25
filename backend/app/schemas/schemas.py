from typing import List, Optional
from pydantic import BaseModel


# ---------------------------------------------------------------------------
# Auth
# ---------------------------------------------------------------------------
class LoginRequest(BaseModel):
    username: str
    password: str

    model_config = {"json_schema_extra": {"example": {"username": "admin", "password": "admin123"}}}


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    username: str
    full_name: str
    role: str


# ---------------------------------------------------------------------------
# Sales
# ---------------------------------------------------------------------------
class SalesRecord(BaseModel):
    product_id: str
    product_name: str
    jumlah_penjualan: int
    harga: float
    diskon: float
    status: str


class SalesListResponse(BaseModel):
    total: int
    data: List[SalesRecord]


# ---------------------------------------------------------------------------
# Prediction
# ---------------------------------------------------------------------------
class PredictRequest(BaseModel):
    jumlah_penjualan: int
    harga: float
    diskon: float

    model_config = {
        "json_schema_extra": {
            "example": {
                "jumlah_penjualan": 200,
                "harga": 85000,
                "diskon": 10,
            }
        }
    }


class PredictResponse(BaseModel):
    status_prediksi: str          # "Laris" | "Tidak"
    probabilitas_laris: float     # 0.0 – 1.0
    probabilitas_tidak: float
    input_data: PredictRequest
