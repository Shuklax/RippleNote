"""Recording service for WebRTC streams."""
import os
import asyncio
import subprocess
from datetime import datetime
from typing import Dict, Optional
from pathlib import Path
import json
from config import settings


# Ensure recordings directory exists
Path(settings.recordings_dir).mkdir(parents=True, exist_ok=True)


# Active recording processes
_active_recordings: Dict[str, Dict] = {}


def generate_recording_filename(room_id: str, user_id: str, media_type: str = "combined") -> str:
    """
    Generate a unique filename for a recording.
    
    Args:
        room_id: The call room ID
        user_id: The user ID
        media_type: Type of media (audio, video, combined)
    
    Returns:
        Filename string
    """
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    return f"{room_id}_{user_id}_{media_type}_{timestamp}.webm"


def get_recording_path(filename: str) -> str:
    """
    Get full path for a recording file.
    
    Args:
        filename: The recording filename
    
    Returns:
        Full file path
    """
    return os.path.join(settings.recordings_dir, filename)


async def start_recording(
    room_id: str,
    user_id: str,
    rtp_stream_url: Optional[str] = None,
    audio_track_path: Optional[str] = None,
    video_track_path: Optional[str] = None
) -> Dict[str, str]:
    """
    Start recording a WebRTC stream locally.
    
    Args:
        room_id: The call room ID
        user_id: The user ID
        rtp_stream_url: Optional RTP stream URL to record
        audio_track_path: Optional path to audio track file
        video_track_path: Optional path to video track file
    
    Returns:
        Recording metadata with recording_id and file path
    """
    recording_id = f"{room_id}_{user_id}_{datetime.now().timestamp()}"
    filename = generate_recording_filename(room_id, user_id)
    filepath = get_recording_path(filename)
    
    # For MVP, we'll record using FFmpeg
    # In production, you'd capture RTP streams from mediasoup
    ffmpeg_cmd = [
        "ffmpeg",
        "-f", "webm",
        "-i", "pipe:0",  # Input from stdin (for future stream input)
        "-c", "copy",
        "-y",  # Overwrite output file
        filepath
    ]
    
    # For now, create a placeholder recording process
    # In production, this would capture actual RTP streams
    process = subprocess.Popen(
        ffmpeg_cmd,
        stdin=subprocess.PIPE,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE
    )
    
    recording_info = {
        "recording_id": recording_id,
        "room_id": room_id,
        "user_id": user_id,
        "filename": filename,
        "filepath": filepath,
        "process": process,
        "started_at": datetime.now().isoformat(),
        "status": "recording"
    }
    
    _active_recordings[recording_id] = recording_info
    
    return {
        "recording_id": recording_id,
        "filename": filename,
        "filepath": filepath,
        "status": "recording"
    }


async def stop_recording(recording_id: str) -> Dict[str, str]:
    """
    Stop an active recording.
    
    Args:
        recording_id: The recording ID
    
    Returns:
        Recording metadata with final status
    """
    if recording_id not in _active_recordings:
        raise ValueError(f"Recording {recording_id} not found")
    
    recording_info = _active_recordings[recording_id]
    process = recording_info["process"]
    
    # Stop the FFmpeg process
    try:
        process.terminate()
        process.wait(timeout=5)
    except subprocess.TimeoutExpired:
        process.kill()
    except Exception as e:
        print(f"Error stopping recording: {e}")
    
    recording_info["status"] = "stopped"
    recording_info["stopped_at"] = datetime.now().isoformat()
    
    return {
        "recording_id": recording_id,
        "filename": recording_info["filename"],
        "filepath": recording_info["filepath"],
        "status": "stopped",
        "duration": "calculated"  # Would calculate actual duration
    }


def get_recording_info(recording_id: str) -> Optional[Dict]:
    """
    Get information about a recording.
    
    Args:
        recording_id: The recording ID
    
    Returns:
        Recording information or None
    """
    return _active_recordings.get(recording_id)


def list_recordings(room_id: Optional[str] = None) -> list:
    """
    List all recordings, optionally filtered by room_id.
    
    Args:
        room_id: Optional room ID to filter by
    
    Returns:
        List of recording information
    """
    recordings = list(_active_recordings.values())
    
    if room_id:
        recordings = [r for r in recordings if r["room_id"] == room_id]
    
    # Remove process object from response
    return [
        {k: v for k, v in r.items() if k != "process"}
        for r in recordings
    ]


