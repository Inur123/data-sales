from datetime import timedelta

from fastapi import APIRouter, HTTPException, status

from app.core.security import authenticate_user, create_access_token
from app.core.config import settings
from app.schemas.schemas import LoginRequest, TokenResponse

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post(
    "/login",
    response_model=TokenResponse,
    summary="Login dan dapatkan JWT token",
    description=(
        "Gunakan username/password untuk mendapatkan access token. "
        "**Dummy credentials:** `admin / admin123` atau `user / user123`."
    ),
)
def login(credentials: LoginRequest):
    user = authenticate_user(credentials.username, credentials.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Username atau password salah",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token = create_access_token(
        data={"sub": user["username"]},
        expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES),
    )

    return TokenResponse(
        access_token=access_token,
        username=user["username"],
        full_name=user["full_name"],
        role=user["role"],
    )
