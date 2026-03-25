from typing import Optional

from fastapi import APIRouter, Depends, Query

from app.core.dependencies import get_current_user
from app.schemas.schemas import SalesListResponse, SalesRecord
from app.services.sales_service import load_sales_data

router = APIRouter(prefix="/sales", tags=["Sales Data"])


@router.get(
    "",
    response_model=SalesListResponse,
    summary="Ambil semua data penjualan",
    description=(
        "Mengembalikan seluruh data penjualan dari CSV. "
        "Mendukung filter opsional berdasarkan `status` (Laris / Tidak) "
        "dan pencarian `product_name`."
    ),
)
def get_sales(
    status: Optional[str] = Query(
        None,
        description="Filter berdasarkan status: `Laris` atau `Tidak`",
        example="Laris",
    ),
    search: Optional[str] = Query(
        None,
        description="Cari berdasarkan nama produk (case-insensitive)",
        example="Produk 1",
    ),
    current_user: dict = Depends(get_current_user),
):
    records = load_sales_data()

    if status:
        records = [r for r in records if r["status"].strip().lower() == status.strip().lower()]

    if search:
        records = [r for r in records if search.lower() in r["product_name"].lower()]

    return SalesListResponse(
        total=len(records),
        data=[SalesRecord(**r) for r in records],
    )
