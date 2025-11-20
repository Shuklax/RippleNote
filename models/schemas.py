"""Pydantic schemas for API requests and responses."""
from pydantic import BaseModel
from typing import Optional, Dict, Any


class CreateCallRequest(BaseModel):
    """Request to create a new call room."""
    user_id: str
    rtp_capabilities: Optional[Dict[str, Any]] = None


class JoinCallRequest(BaseModel):
    """Request to join a call room."""
    user_id: str
    rtp_capabilities: Optional[Dict[str, Any]] = None


class TransportConnectRequest(BaseModel):
    """Request to connect a transport."""
    dtls_parameters: Dict[str, Any]


class CreateProducerRequest(BaseModel):
    """Request to create a producer."""
    rtp_parameters: Dict[str, Any]
    kind: str  # "audio" or "video"


class CreateConsumerRequest(BaseModel):
    """Request to create a consumer."""
    producer_id: str
    rtp_capabilities: Dict[str, Any]


class StartRecordingRequest(BaseModel):
    """Request to start recording."""
    user_id: str


class CallResponse(BaseModel):
    """Response for call operations."""
    room_id: str
    router_id: str
    rtp_capabilities: Dict[str, Any]
    transport: Dict[str, Any]
    status: str


class RecordingResponse(BaseModel):
    """Response for recording operations."""
    recording_id: str
    filename: str
    filepath: str
    status: str


class S3UploadResponse(BaseModel):
    """Response for S3 upload operations."""
    recording_id: str
    s3_bucket: str
    s3_key: str
    s3_url: str
    status: str


