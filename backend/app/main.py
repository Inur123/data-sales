from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.routers import auth_router, sales_router, predict_router

# ---------------------------------------------------------------------------
# App init
# ---------------------------------------------------------------------------
app = FastAPI(
    title="Mini AI Sales Prediction API",
    description=(
        "REST API untuk **manajemen data penjualan** dan **prediksi status produk** "
        "(Laris / Tidak) menggunakan Machine Learning.\n\n"
        "### Cara pakai:\n"
        "1. **Login** via `POST /api/v1/auth/login` → dapatkan `access_token`\n"
        "2. Klik tombol **Authorize** di atas (masukkan token)\n"
        "3. Gunakan endpoint `/sales` dan `/predict`"
    ),
    version="1.0.0",
    contact={"name": "Mini Sales AI", "email": "dev@example.com"},
    license_info={"name": "MIT"},
)

# ---------------------------------------------------------------------------
# CORS  (open for dev; tighten in production)
# ---------------------------------------------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# Global exception handler
# ---------------------------------------------------------------------------
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={"detail": f"Internal server error: {str(exc)}"},
    )

# ---------------------------------------------------------------------------
# Routers
# ---------------------------------------------------------------------------
PREFIX = "/api/v1"

app.include_router(auth_router.router, prefix=PREFIX)
app.include_router(sales_router.router, prefix=PREFIX)
app.include_router(predict_router.router, prefix=PREFIX)


# ---------------------------------------------------------------------------
# Health check
# ---------------------------------------------------------------------------
@app.get("/", tags=["Health"], summary="Health check")
def root():
    return {
        "status": "ok",
        "service": "Mini AI Sales Prediction API",
        "version": "1.0.0",
        "docs": "/docs",
    }
