"""Mediasoup SFU client integration."""
import aiohttp
import json
from typing import Dict, Any, Optional
from config import settings


async def create_mediasoup_router() -> Dict[str, Any]:
    """
    Create a new mediasoup router for a call room.
    
    Returns:
        Router configuration with RTP capabilities
    """
    url = f"{settings.mediasoup_protocol}://{settings.mediasoup_host}:{settings.mediasoup_port}/api/router/create"
    
    async with aiohttp.ClientSession() as session:
        async with session.post(url) as response:
            if response.status == 200:
                return await response.json()
            raise Exception(f"Failed to create router: {response.status}")


async def create_mediasoup_transport(router_id: str, direction: str = "sendrecv") -> Dict[str, Any]:
    """
    Create a WebRTC transport in mediasoup.
    
    Args:
        router_id: The router ID
        direction: Transport direction (sendrecv, sendonly, recvonly)
    
    Returns:
        Transport configuration with ICE parameters
    """
    url = f"{settings.mediasoup_protocol}://{settings.mediasoup_host}:{settings.mediasoup_port}/api/transport/create"
    
    payload = {
        "router_id": router_id,
        "direction": direction
    }
    
    async with aiohttp.ClientSession() as session:
        async with session.post(url, json=payload) as response:
            if response.status == 200:
                return await response.json()
            raise Exception(f"Failed to create transport: {response.status}")


async def connect_transport(
    router_id: str,
    transport_id: str,
    dtls_parameters: Dict[str, Any]
) -> bool:
    """
    Connect a transport with DTLS parameters.
    
    Args:
        router_id: The router ID
        transport_id: The transport ID
        dtls_parameters: DTLS parameters from client
    
    Returns:
        True if successful
    """
    url = f"{settings.mediasoup_protocol}://{settings.mediasoup_host}:{settings.mediasoup_port}/api/transport/connect"
    
    payload = {
        "router_id": router_id,
        "transport_id": transport_id,
        "dtls_parameters": dtls_parameters
    }
    
    async with aiohttp.ClientSession() as session:
        async with session.post(url, json=payload) as response:
            return response.status == 200


async def create_producer(
    router_id: str,
    transport_id: str,
    rtp_parameters: Dict[str, Any]
) -> Dict[str, Any]:
    """
    Create a producer (audio/video sender) in mediasoup.
    
    Args:
        router_id: The router ID
        transport_id: The transport ID
        rtp_parameters: RTP parameters from client
    
    Returns:
        Producer configuration
    """
    url = f"{settings.mediasoup_protocol}://{settings.mediasoup_host}:{settings.mediasoup_port}/api/producer/create"
    
    payload = {
        "router_id": router_id,
        "transport_id": transport_id,
        "rtp_parameters": rtp_parameters
    }
    
    async with aiohttp.ClientSession() as session:
        async with session.post(url, json=payload) as response:
            if response.status == 200:
                return await response.json()
            raise Exception(f"Failed to create producer: {response.status}")


async def create_consumer(
    router_id: str,
    transport_id: str,
    producer_id: str,
    rtp_capabilities: Dict[str, Any]
) -> Dict[str, Any]:
    """
    Create a consumer (audio/video receiver) in mediasoup.
    
    Args:
        router_id: The router ID
        transport_id: The transport ID
        producer_id: The producer ID to consume
        rtp_capabilities: RTP capabilities from client
    
    Returns:
        Consumer configuration with RTP parameters
    """
    url = f"{settings.mediasoup_protocol}://{settings.mediasoup_host}:{settings.mediasoup_port}/api/consumer/create"
    
    payload = {
        "router_id": router_id,
        "transport_id": transport_id,
        "producer_id": producer_id,
        "rtp_capabilities": rtp_capabilities
    }
    
    async with aiohttp.ClientSession() as session:
        async with session.post(url, json=payload) as response:
            if response.status == 200:
                return await response.json()
            raise Exception(f"Failed to create consumer: {response.status}")


async def get_router_rtp_capabilities(router_id: str) -> Dict[str, Any]:
    """
    Get RTP capabilities for a router.
    
    Args:
        router_id: The router ID
    
    Returns:
        RTP capabilities
    """
    url = f"{settings.mediasoup_protocol}://{settings.mediasoup_host}:{settings.mediasoup_port}/api/router/{router_id}/rtp-capabilities"
    
    async with aiohttp.ClientSession() as session:
        async with session.get(url) as response:
            if response.status == 200:
                return await response.json()
            raise Exception(f"Failed to get RTP capabilities: {response.status}")


async def close_router(router_id: str) -> bool:
    """
    Close a router and cleanup resources.
    
    Args:
        router_id: The router ID
    
    Returns:
        True if successful
    """
    url = f"{settings.mediasoup_protocol}://{settings.mediasoup_host}:{settings.mediasoup_port}/api/router/{router_id}/close"
    
    async with aiohttp.ClientSession() as session:
        async with session.post(url) as response:
            return response.status == 200


