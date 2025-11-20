# RippleNote Mediasoup SFU

Modular, production-minded Mediasoup server that powers RippleNote's peer-to-peer and SFU audio/video flows.

## Repository Layout

```
mediasoup-server/
├── index.js             # HTTP entry point, health checks, route wiring
├── router/              # Worker bootstrap + router lifecycle management
├── transports/          # WebRTC transport orchestration
├── producers/           # Media producers orchestration and hooks
├── consumers/           # Media consumers orchestration and hooks
├── Dockerfile           # Container image optimized for mediasoup workloads
└── README.md
```

## Getting Started

```bash
cd mediasoup-server
npm install
npm start
```

The server listens on `HTTP_PORT` (defaults to `3000`) and exposes REST endpoints under `/api/*`.

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `HTTP_PORT` | `3000` | Express HTTP server port |
| `MEDIASOUP_WORKERS` | `min(cpus, 4)` | Number of mediasoup workers |
| `MEDIASOUP_LOG_LEVEL` | `warn` | Worker log verbosity |
| `MEDIASOUP_LOG_TAGS` | `info,ice,dtls,rtp,srtp,rtcp` | Comma-separated worker log tags |
| `MEDIASOUP_RTC_MIN_PORT` | `40000` | Min UDP/TCP port for RTP |
| `MEDIASOUP_RTC_MAX_PORT` | `49999` | Max UDP/TCP port for RTP |
| `MEDIASOUP_LISTEN_IP` | `0.0.0.0` | Local interface for transports |
| `MEDIASOUP_ANNOUNCED_IP` | unset | Public IP (when behind NAT/bastion) |

Create a `.env` file (or configure env vars in your orchestrator) to tune the deployment.

## API Snapshot

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/health` | GET | Service health + uptime |
| `/api/router/create` | POST | Create router + return RTP capabilities |
| `/api/router/:routerId/rtp-capabilities` | GET | Retrieve capabilities for existing router |
| `/api/router/:routerId/close` | POST | Tear down router and associated resources |
| `/api/transport/create` | POST | Create WebRTC transport for a router |
| `/api/transport/connect` | POST | Connect DTLS parameters |
| `/api/producer/create` | POST | Attach a producer to a transport |
| `/api/consumer/create` | POST | Attach a consumer to a transport/producer |

All bodies are JSON encoded; see `QUICKSTART.md` under the backend for request/response samples.

## Docker

Build & run:

```bash
docker build -t ripplenote-mediasoup .
docker run --rm -p 3000:3000 --network host \
  -e MEDIASOUP_LISTEN_IP=0.0.0.0 \
  -e MEDIASOUP_ANNOUNCED_IP=<public-ip> \
  ripplenote-mediasoup
```

The Dockerfile ships with `tini` for PID 1 signal handling and exposes `3000/tcp`.

## Operations Checklist

- Structured logging via Express + worker events (visible in container logs)
- Graceful shutdown on worker death (process exits to allow orchestrator restart)
- Resource bookkeeping (routers/transports/producers/consumers stored centrally)
- Input validation & actionable HTTP errors

Extend the folder-level services with monitoring hooks (Prometheus/OpenTelemetry) or persistence (Redis) as needed.

