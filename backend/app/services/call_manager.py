"""Call room management service."""
import uuid
from typing import Dict, Optional, Any
from datetime import datetime
from services.mediasoup_client import (
    create_mediasoup_router,
    get_router_rtp_capabilities,
    create_mediasoup_transport,
    close_router
)


# In-memory storage for active calls (use Redis/DB in production)
_active_calls: Dict[str, Dict] = {}


async def create_call_room(user_id: str) -> Dict[str, Any]:
    """
    Create a new 1:1 call room.
    
    Args:
        user_id: The user ID creating the room
    
    Returns:
        Call room configuration with router and transport info
    """
    room_id = str(uuid.uuid4())
    
    # Create mediasoup router
    router_config = await create_mediasoup_router()
    router_id = router_config.get("router_id")
    
    # Get RTP capabilities
    rtp_capabilities = await get_router_rtp_capabilities(router_id)
    
    # Create transport for the first user
    transport = await create_mediasoup_transport(router_id, "sendrecv")
    
    call_info = {
        "room_id": room_id,
        "router_id": router_id,
        "created_by": user_id,
        "participants": [user_id],
        "transports": {
            user_id: transport
        },
        "producers": {},
        "consumers": {},
        "created_at": datetime.now().isoformat(),
        "status": "active"
    }
    
    _active_calls[room_id] = call_info
    
    return {
        "room_id": room_id,
        "router_id": router_id,
        "rtp_capabilities": rtp_capabilities,
        "transport": transport,
        "status": "created"
    }


async def join_call_room(room_id: str, user_id: str) -> Dict[str, Any]:
    """
    Join an existing call room (second participant).
    
    Args:
        room_id: The call room ID
        user_id: The user ID joining
    
    Returns:
        Call room configuration with router and transport info
    """
    if room_id not in _active_calls:
        raise ValueError(f"Call room {room_id} not found")
    
    call_info = _active_calls[room_id]
    
    if user_id in call_info["participants"]:
        raise ValueError(f"User {user_id} already in room")
    
    if len(call_info["participants"]) >= 2:
        raise ValueError("Call room is full (1:1 call only)")
    
    router_id = call_info["router_id"]
    
    # Get RTP capabilities
    rtp_capabilities = await get_router_rtp_capabilities(router_id)
    
    # Create transport for the joining user
    transport = await create_mediasoup_transport(router_id, "sendrecv")
    
    # Add user to participants
    call_info["participants"].append(user_id)
    call_info["transports"][user_id] = transport
    
    return {
        "room_id": room_id,
        "router_id": router_id,
        "rtp_capabilities": rtp_capabilities,
        "transport": transport,
        "status": "joined"
    }


async def leave_call_room(room_id: str, user_id: str) -> bool:
    """
    Leave a call room and cleanup if empty.
    
    Args:
        room_id: The call room ID
        user_id: The user ID leaving
    
    Returns:
        True if successful
    """
    if room_id not in _active_calls:
        return False
    
    call_info = _active_calls[room_id]
    
    if user_id in call_info["participants"]:
        call_info["participants"].remove(user_id)
    
    # Remove user's transport
    if user_id in call_info["transports"]:
        del call_info["transports"][user_id]
    
    # Remove user's producers/consumers
    call_info["producers"] = {
        k: v for k, v in call_info["producers"].items()
        if not k.startswith(f"{user_id}_")
    }
    call_info["consumers"] = {
        k: v for k, v in call_info["consumers"].items()
        if not k.startswith(f"{user_id}_")
    }
    
    # If room is empty, close router and remove room
    if len(call_info["participants"]) == 0:
        router_id = call_info["router_id"]
        await close_router(router_id)
        del _active_calls[room_id]
    
    return True


def get_call_info(room_id: str) -> Optional[Dict]:
    """
    Get information about a call room.
    
    Args:
        room_id: The call room ID
    
    Returns:
        Call room information or None
    """
    return _active_calls.get(room_id)


async def add_producer_to_call(
    room_id: str,
    user_id: str,
    transport_id: str,
    rtp_parameters: Dict,
    kind: str
) -> Dict:
    """
    Add a producer (audio/video sender) to a call.
    
    Args:
        room_id: The call room ID
        user_id: The user ID
        transport_id: The transport ID
        rtp_parameters: RTP parameters
        kind: Media kind (audio/video)
    
    Returns:
        Producer configuration
    """
    call_info = get_call_info(room_id)
    if not call_info:
        raise ValueError(f"Call room {room_id} not found")
    
    router_id = call_info["router_id"]
    
    from services.mediasoup_client import create_producer
    producer = await create_producer(router_id, transport_id, rtp_parameters)
    
    producer_key = f"{user_id}_{kind}"
    call_info["producers"][producer_key] = producer
    
    return producer


async def add_consumer_to_call(
    room_id: str,
    user_id: str,
    transport_id: str,
    producer_id: str,
    rtp_capabilities: Dict
) -> Dict:
    """
    Add a consumer (audio/video receiver) to a call.
    
    Args:
        room_id: The call room ID
        user_id: The user ID
        transport_id: The transport ID
        producer_id: The producer ID to consume
        rtp_capabilities: RTP capabilities
    
    Returns:
        Consumer configuration
    """
    call_info = get_call_info(room_id)
    if not call_info:
        raise ValueError(f"Call room {room_id} not found")
    
    router_id = call_info["router_id"]
    
    from services.mediasoup_client import create_consumer
    consumer = await create_consumer(router_id, transport_id, producer_id, rtp_capabilities)
    
    consumer_key = f"{user_id}_{producer_id}"
    call_info["consumers"][consumer_key] = consumer
    
    return consumer

