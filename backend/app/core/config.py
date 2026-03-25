from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    SECRET_KEY: str = "supersecret-jwt-key-mini-sales-ai-2024"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    CSV_PATH: str = "../data/sales_data.csv"
    MODEL_PATH: str = "../ml/model/sales_model.joblib"

    class Config:
        env_file = ".env"


settings = Settings()
