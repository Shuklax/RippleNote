"""Main FastAPI application for WebRTC call infrastructure."""
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import Dict, Any
import uvicorn

from config import settings
from models.schemas import (
    CreateCallRequest,
    JoinCallRequest,
    TransportConnectRequest,
    CreateProducerRequest,
    CreateConsumerRequest,
    StartRecordingRequest,
    CallResponse,
    RecordingResponse,
    S3UploadResponse
)
from services.call_manager import (
    create_call_room,
    join_call_room,
    leave_call_room,
    get_call_info,
    add_producer_to_call,
    add_consumer_to_call
)
from services.mediasoup_client import connect_transport
from services.recording_service import (
    start_recording,
    stop_recording,
    get_recording_info,
    list_recordings
)
from services.s3_service import upload_recording_to_s3


app = FastAPI(
    title="RippleNote API",
    description="WebRTC 1:1 Call Infrastructure with Mediasoup SFU",
    version="1.0.0"
)

# CORS middleware for UI integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    """Health check endpoint."""
    return {
        "status": "ok",
        "service": "RippleNote",
        "version": "1.0.0"
    }


@app.get("/api/health")
async def health_check():
    """Detailed health check."""
    return {
        "status": "healthy",
        "mediasoup": {
            "host": settings.mediasoup_host,
            "port": settings.mediasoup_port
        },
        "s3_configured": bool(settings.s3_bucket_name and settings.aws_access_key_id)
    }


# Call Management Endpoints

@app.post("/api/call/create", response_model=CallResponse)
async def create_call(request: CreateCallRequest):
    """
    Create a new 1:1 call room.
    
    Returns router configuration and transport for the first participant.
    """
    try:
        result = await create_call_room(request.user_id)
        return CallResponse(
            room_id=result["room_id"],
            router_id=result["router_id"],
            rtp_capabilities=result["rtp_capabilities"],
            transport=result["transport"],
            status=result["status"]
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/call/join/{room_id}", response_model=CallResponse)
async def join_call(room_id: str, request: JoinCallRequest):
    """
    Join an existing call room (second participant for 1:1 call).
    
    Returns router configuration and transport for the joining participant.
    """
    try:
        result = await join_call_room(room_id, request.user_id)
        return CallResponse(
            room_id=result["room_id"],
            router_id=result["router_id"],
            rtp_capabilities=result["rtp_capabilities"],
            transport=result["transport"],
            status=result["status"]
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/call/leave/{room_id}")
async def leave_call(room_id: str, user_id: str):
    """
    Leave a call room.
    
    Cleans up resources if room becomes empty.
    """
    try:
        success = await leave_call_room(room_id, user_id)
        if success:
            return {"status": "left", "room_id": room_id}
        else:
            raise HTTPException(status_code=404, detail="Call room not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/call/{room_id}")
async def get_call(room_id: str):
    """Get information about a call room."""
    call_info = get_call_info(room_id)
    if not call_info:
        raise HTTPException(status_code=404, detail="Call room not found")
    
    # Remove internal data before returning
    return {
        "room_id": call_info["room_id"],
        "participants": call_info["participants"],
        "status": call_info["status"],
        "created_at": call_info["created_at"]
    }


# WebRTC Transport Endpoints

@app.post("/api/call/{room_id}/transport/{transport_id}/connect")
async def connect_transport_endpoint(
    room_id: str,
    transport_id: str,
    request: TransportConnectRequest
):
    """
    Connect a WebRTC transport with DTLS parameters.
    
    This is called by the client after creating a transport.
    """
    try:
        call_info = get_call_info(room_id)
        if not call_info:
            raise HTTPException(status_code=404, detail="Call room not found")
        
        router_id = call_info["router_id"]
        success = await connect_transport(
            router_id,
            transport_id,
            request.dtls_parameters
        )
        
        if success:
            return {"status": "connected", "transport_id": transport_id}
        else:
            raise HTTPException(status_code=500, detail="Failed to connect transport")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Producer/Consumer Endpoints

@app.post("/api/call/{room_id}/producer")
async def create_producer_endpoint(
    room_id: str,
    user_id: str,
    transport_id: str,
    request: CreateProducerRequest
):
    """
    Create a producer (audio/video sender) in the call.
    
    This is called when a participant starts sending media.
    """
    try:
        producer = await add_producer_to_call(
            room_id,
            user_id,
            transport_id,
            request.rtp_parameters,
            request.kind
        )
        return {
            "producer_id": producer.get("producer_id"),
            "kind": request.kind,
            "status": "created"
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/call/{room_id}/consumer")
async def create_consumer_endpoint(
    room_id: str,
    user_id: str,
    transport_id: str,
    request: CreateConsumerRequest
):
    """
    Create a consumer (audio/video receiver) in the call.
    
    This is called when a participant wants to receive media from another participant.
    """
    try:
        consumer = await add_consumer_to_call(
            room_id,
            user_id,
            transport_id,
            request.producer_id,
            request.rtp_capabilities
        )
        return {
            "consumer_id": consumer.get("consumer_id"),
            "producer_id": request.producer_id,
            "rtp_parameters": consumer.get("rtp_parameters"),
            "status": "created"
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Recording Endpoints

@app.post("/api/recording/start/{room_id}", response_model=RecordingResponse)
async def start_recording_endpoint(room_id: str, request: StartRecordingRequest):
    """
    Start recording a call for a specific user.
    
    Records the user's local stream.
    """
    try:
        # Verify call exists
        call_info = get_call_info(room_id)
        if not call_info:
            raise HTTPException(status_code=404, detail="Call room not found")
        
        if request.user_id not in call_info["participants"]:
            raise HTTPException(status_code=403, detail="User not in call room")
        
        result = await start_recording(room_id, request.user_id)
        return RecordingResponse(
            recording_id=result["recording_id"],
            filename=result["filename"],
            filepath=result["filepath"],
            status=result["status"]
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/recording/stop/{recording_id}", response_model=RecordingResponse)
async def stop_recording_endpoint(recording_id: str):
    """
    Stop an active recording.
    """
    try:
        result = await stop_recording(recording_id)
        return RecordingResponse(
            recording_id=result["recording_id"],
            filename=result["filename"],
            filepath=result["filepath"],
            status=result["status"]
        )
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/recording/{recording_id}")
async def get_recording(recording_id: str):
    """Get information about a recording."""
    recording_info = get_recording_info(recording_id)
    if not recording_info:
        raise HTTPException(status_code=404, detail="Recording not found")
    
    # Remove process object
    return {k: v for k, v in recording_info.items() if k != "process"}


@app.get("/api/recording/list")
async def list_recordings_endpoint(room_id: str = None):
    """List all recordings, optionally filtered by room_id."""
    recordings = list_recordings(room_id)
    return {"recordings": recordings, "count": len(recordings)}


# S3 Upload Endpoints

@app.post("/api/recording/upload/{recording_id}", response_model=S3UploadResponse)
async def upload_recording(recording_id: str):
    """
    Upload a recording to S3.
    
    The recording must be stopped before uploading.
    """
    try:
        recording_info = get_recording_info(recording_id)
        if not recording_info:
            raise HTTPException(status_code=404, detail="Recording not found")
        
        if recording_info["status"] != "stopped":
            raise HTTPException(
                status_code=400,
                detail="Recording must be stopped before uploading"
            )
        
        result = await upload_recording_to_s3(
            recording_info["filepath"],
            recording_id
        )
        
        return S3UploadResponse(
            recording_id=result["recording_id"],
            s3_bucket=result["s3_bucket"],
            s3_key=result["s3_key"],
            s3_url=result["s3_url"],
            status=result["status"]
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except FileNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host=settings.server_host,
        port=settings.server_port,
        reload=True
    )


