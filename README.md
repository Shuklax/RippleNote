# RippleNote - WebRTC 1:1 Call Infrastructure

A production-ready WebRTC infrastructure using Mediasoup as SFU with local recording and S3 storage capabilities.

## Features

- 1:1 WebRTC video/audio calls via Mediasoup SFU
- Local recording on both client sides
- S3 storage integration for recordings
- Clean function-based architecture
- FastAPI backend ready for UI integration

## Architecture

- **Backend**: FastAPI (Python)
- **SFU**: Mediasoup (Node.js server, controlled via HTTP API)
- **Recording**: Local FFmpeg-based recording
- **Storage**: AWS S3