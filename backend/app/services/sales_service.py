import os
import pandas as pd
from fastapi import HTTPException, status

from app.core.config import settings


def load_sales_data() -> list[dict]:
    """
    Read the CSV and return a list of dicts suitable for the SalesRecord schema.
    Raises HTTP 503 if the file is missing or malformed.
    """
    csv_path = os.path.abspath(
        os.path.join(os.path.dirname(__file__), "..", "..", settings.CSV_PATH)
    )

    if not os.path.exists(csv_path):
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Dataset not found at path: {csv_path}",
        )

    try:
        df = pd.read_csv(csv_path)
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Failed to read dataset: {exc}",
        )

    required_cols = {"product_id", "product_name", "jumlah_penjualan", "harga", "diskon", "status"}
    missing = required_cols - set(df.columns)
    if missing:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Dataset is missing columns: {missing}",
        )

    # Ensure correct types
    df["jumlah_penjualan"] = pd.to_numeric(df["jumlah_penjualan"], errors="coerce").fillna(0).astype(int)
    df["harga"] = pd.to_numeric(df["harga"], errors="coerce").fillna(0).astype(float)
    df["diskon"] = pd.to_numeric(df["diskon"], errors="coerce").fillna(0).astype(float)
    df["product_id"] = df["product_id"].astype(str)
    df["product_name"] = df["product_name"].astype(str)
    df["status"] = df["status"].astype(str)

    return df.to_dict(orient="records")
