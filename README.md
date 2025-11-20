# RippleNote

Production-ready WebRTC infrastructure for privacy-focused note taking and live collaboration. RippleNote pairs a FastAPI backend with a modular Mediasoup SFU service, optional recording, and S3 storage for long-lived assets.

## System Overview

- 1:1 WebRTC video/audio sessions orchestrated through Mediasoup
- FastAPI backend that manages calls, signaling, recording, and storage metadata
- Local FFmpeg-based recording with optional S3 upload
- Modular Node.js mediasoup server tailored for containerized deployments

## Architecture



## Repository Layout

| Path | Description |
|------|-------------|
| `backend/` | FastAPI application, domain models, services, and docs |
| `mediasoup-server/` | Node.js Mediasoup SFU service with Docker support |
| `frontend/` | Client integrations and experiments |

See `backend/README.md` and `mediasoup-server/README.md` for component-level detail.

## Getting Started

1. **Backend** – install Python dependencies and run `uvicorn` as described in `backend/README.md`.
2. **Mediasoup Server** – install Node dependencies (`npm install`) then run `npm start` inside `mediasoup-server/`.
3. **Configure Environment** – create a `.env` file with backend + mediasoup host/port info, and optional AWS/S3 + recording configuration.
4. **Try the APIs** – open `http://localhost:8000/docs` for interactive FastAPI docs and use the Mediasoup endpoints to bootstrap transports.
