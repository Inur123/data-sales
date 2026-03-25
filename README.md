# Mini AI Sales Prediction System

Sistem mini untuk **manajemen data penjualan** dan **prediksi status produk (Laris / Tidak)** menggunakan Machine Learning.

---

## 📸 Screenshots

- **Login Page**: [screenshots/login.png](./screenshots/login.png)
- **Dashboard**: [screenshots/dashboard.png](./screenshots/dashboard.png)
- **API Documentation**: [screenshots/swagger.png](./screenshots/swagger.png)

---

## Struktur Project

```
data-sales/
├── backend/
│   ├── app/
│   │   ├── core/
│   │   │   ├── config.py         # App settings & env
│   │   │   ├── security.py       # JWT helpers, dummy users
│   │   │   └── dependencies.py   # FastAPI auth dependency
│   │   ├── routers/
│   │   │   ├── auth_router.py    # POST /api/v1/auth/login
│   │   │   ├── sales_router.py   # GET  /api/v1/sales
│   │   │   └── predict_router.py # POST /api/v1/predict
│   │   ├── schemas/
│   │   │   └── schemas.py        # Pydantic request/response models
│   │   ├── services/
│   │   │   ├── sales_service.py  # CSV loading & validation
│   │   │   └── predict_service.py# ML inference
│   │   └── main.py               # FastAPI app factory
│   └── requirements.txt
├── ml/
│   ├── train.py                  # Training script
│   └── model/                    # Auto-created on training
│       ├── sales_model.joblib
│       └── evaluation.json
├── screenshots/          # Simpan screenshot UI di sini
├── data/
│   └── sales_data.csv
└── README.md
```

---

## Cara Menjalankan

### 1. Prasyarat

- Python 3.10+
- pip

### 2. Setup Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate          # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 3. Train Model ML

> Wajib dijalankan sebelum endpoint `/predict` bisa digunakan. Pastikan venv backend sudah diinstall.

```bash
# Dari root project (data-sales/)
./backend/venv/bin/python3 ml/train.py
```

Output yang dihasilkan:
- `ml/model/sales_model.joblib` – model yang disimpan
- `ml/model/evaluation.json` – hasil evaluasi (accuracy, classification report, confusion matrix)

### 4. Jalankan Backend

```bash
cd backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### 5. Akses API & Dokumentasi

| URL | Keterangan |
|-----|------------|
| http://localhost:8000/docs | Swagger UI (interaktif) |
| http://localhost:8000/redoc | ReDoc |
| http://localhost:8000/ | Health check |

---

## API Endpoints

### Authentication

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| POST | `/api/v1/auth/login` | Login dan dapatkan JWT token |

**Dummy credentials:**

| Username | Password | Role |
|----------|----------|------|
| `admin` | `admin123` | admin |
| `user` | `user123` | viewer |

**Contoh request:**
```json
POST /api/v1/auth/login
{
  "username": "admin",
  "password": "admin123"
}
```

**Response:**
```json
{
  "access_token": "eyJ...",
  "token_type": "bearer",
  "username": "admin",
  "full_name": "Administrator",
  "role": "admin"
}
```

---

### Sales Data

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | `/api/v1/sales` | Ambil semua data penjualan |
| GET | `/api/v1/sales?status=Laris` | Filter berdasarkan status |
| GET | `/api/v1/sales?search=Produk 1` | Cari berdasarkan nama |

> Semua endpoint membutuhkan header: `Authorization: Bearer <token>`

**Response:**
```json
{
  "total": 50,
  "data": [
    {
      "product_id": "P00001",
      "product_name": "Produk 1",
      "jumlah_penjualan": 57,
      "harga": 26556.0,
      "diskon": 25.0,
      "status": "Tidak"
    }
  ]
}
```

---

### Prediction

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| POST | `/api/v1/predict` | Prediksi status produk |

**Request:**
```json
{
  "jumlah_penjualan": 200,
  "harga": 85000,
  "diskon": 10
}
```

**Response:**
```json
{
  "status_prediksi": "Laris",
  "probabilitas_laris": 0.87,
  "probabilitas_tidak": 0.13,
  "input_data": {
    "jumlah_penjualan": 200,
    "harga": 85000,
    "diskon": 10
  }
}
```

---

## Machine Learning

### Frontend
- **Framework**: React JS (Vite)
- **Styling**: Tailwind CSS + Shadcn design pattern
- **Features**: JWT Login, Search, Client-side Pagination, Responsive Grid
- **Icons**: Lucide-react

### Preprocessing
- Drop baris dengan nilai kosong
- Label encoding manual: `Laris → 1`, `Tidak → 0`
- `class_weight="balanced"` untuk menangani class imbalance

### Evaluasi
Hasil evaluasi tersimpan di `ml/model/evaluation.json` setelah training.

---

## Design Decisions

| Keputusan | Alasan |
|-----------|--------|
| **FastAPI** | Async support, auto Swagger docs, Pydantic validation built-in |
| **Random Forest** | Robust terhadap outlier, tidak perlu feature scaling, support `class_weight` |
| **JWT Stateless** | Tidak perlu database session, cocok untuk microservice |
| **Layered architecture** | Routers → Services → Core, memudahkan testing dan maintenance |
| **joblib** | Lebih efisien dari pickle untuk numpy arrays (model ML) |

## Asumsi

1. **Dataset** menggunakan file CSV lokal, bukan database.
2. **User management** menggunakan dummy users hardcoded (tidak ada registrasi).
3. **Model** di-train ulang secara manual dengan `python ml/train.py` (tidak ada auto-retrain).
4. **Token** tidak di-revoke (stateless); expired setelah 60 menit.
5. **Threshold** prediksi menggunakan default 0.5 dari `predict_proba`.
