# RippleNote Backend (FastAPI)

The RippleNote backend coordinates call lifecycle, signaling, recording tasks, and integrations with the Mediasoup SFU and AWS S3. It is a FastAPI application designed for lightweight deployments (local dev, containers, serverless-friendly workers).

## Directory Layout

| Path | Purpose |
|------|---------|
| `main.py` | FastAPI app entrypoint (routers, startup hooks) |
| `config.py` | Pydantic settings loader for `.env` / environment variables |
| `app/models/` | Schemas shared across API layers |
| `app/services/` | Core services: call manager, Mediasoup client, recording, and S3 helpers |
| `requirements.txt` | Python dependency lock |
| `QUICKSTART.md` | Step-by-step setup (shared with root quick start) |

## Prerequisites

- Python 3.8+
- FFmpeg (only required for recording features)
- AWS account + S3 bucket (optional, for storing recordings)

## Setup

```bash
cd backend
python -m venv venv
source venv/Scripts/activate   # PowerShell: .\venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

Create a `.env` file (or export environment variables):

```
MEDIASOUP_HOST=localhost
MEDIASOUP_PORT=3000
MEDIASOUP_PROTOCOL=http

SERVER_HOST=0.0.0.0
SERVER_PORT=8000
RECORDINGS_DIR=./recordings

# Optional recording storage
AWS_ACCESS_KEY_ID=xxx
AWS_SECRET_ACCESS_KEY=yyy
AWS_REGION=us-east-1
S3_BUCKET_NAME=my-ripplenote-bucket
```

## Running the API

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Visit `http://localhost:8000/docs` for interactive Swagger/Redoc documentation of all routes.

## Key Services

- **Call Manager (`app/services/call_manager.py`)** – Manages room creation, join/leave events, and orchestrates Mediasoup transports.
- **Mediasoup Client (`app/services/mediasoup_client.py`)** – HTTP client that provisions routers/transports/producers/consumers with the external SFU.
- **Recording Service (`app/services/recording_service.py`)** – Wraps FFmpeg subprocesses for local disk capture and metadata tracking.
- **S3 Service (`app/services/s3_service.py`)** – Handles uploads, object lifecycle, and signed URL creation for recordings.

## Development Notes

- Run `pytest` (once tests are added) or integrate with your preferred test runner.
- Use `watchfiles` with `uvicorn --reload` for live code reload while iterating.
- Logging defaults to standard FastAPI/uvicorn output; wire in your logging provider (ELK, OpenTelemetry) inside `main.py` as needed.



