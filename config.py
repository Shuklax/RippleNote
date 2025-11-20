"""Configuration settings for the application."""
from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""
    
    # Mediasoup settings
    mediasoup_host: str = "localhost"
    mediasoup_port: int = 3000
    mediasoup_protocol: str = "http"
    
    # AWS S3 settings
    aws_access_key_id: Optional[str] = None
    aws_secret_access_key: Optional[str] = None
    aws_region: str = "us-east-1"
    s3_bucket_name: Optional[str] = None
    
    # Recording settings
    recordings_dir: str = "./recordings"
    
    # Server settings
    server_host: str = "0.0.0.0"
    server_port: int = 8000
    
    class Config:
        env_file = ".env"
        case_sensitive = False


settings = Settings()


