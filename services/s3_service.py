"""S3 service for uploading recordings."""
import boto3
import os
from typing import Optional
from botocore.exceptions import ClientError
from config import settings


def get_s3_client():
    """
    Get configured S3 client.
    
    Returns:
        boto3 S3 client
    """
    if not settings.aws_access_key_id or not settings.aws_secret_access_key:
        raise ValueError("AWS credentials not configured")
    
    return boto3.client(
        's3',
        aws_access_key_id=settings.aws_access_key_id,
        aws_secret_access_key=settings.aws_secret_access_key,
        region_name=settings.aws_region
    )


async def upload_recording_to_s3(
    filepath: str,
    recording_id: str,
    bucket_name: Optional[str] = None
) -> Dict[str, str]:
    """
    Upload a recording file to S3.
    
    Args:
        filepath: Local file path to upload
        recording_id: The recording ID (used for S3 key)
        bucket_name: Optional bucket name (uses config default if not provided)
    
    Returns:
        Upload result with S3 URL and key
    """
    if not os.path.exists(filepath):
        raise FileNotFoundError(f"Recording file not found: {filepath}")
    
    bucket = bucket_name or settings.s3_bucket_name
    if not bucket:
        raise ValueError("S3 bucket name not configured")
    
    # Generate S3 key
    filename = os.path.basename(filepath)
    s3_key = f"recordings/{recording_id}/{filename}"
    
    try:
        s3_client = get_s3_client()
        
        # Upload file
        s3_client.upload_file(
            filepath,
            bucket,
            s3_key,
            ExtraArgs={
                'ContentType': 'video/webm',
                'Metadata': {
                    'recording-id': recording_id
                }
            }
        )
        
        # Generate URL
        s3_url = f"https://{bucket}.s3.{settings.aws_region}.amazonaws.com/{s3_key}"
        
        return {
            "recording_id": recording_id,
            "s3_bucket": bucket,
            "s3_key": s3_key,
            "s3_url": s3_url,
            "status": "uploaded"
        }
    
    except ClientError as e:
        raise Exception(f"Failed to upload to S3: {str(e)}")


async def delete_recording_from_s3(
    s3_key: str,
    bucket_name: Optional[str] = None
) -> bool:
    """
    Delete a recording from S3.
    
    Args:
        s3_key: The S3 object key
        bucket_name: Optional bucket name (uses config default if not provided)
    
    Returns:
        True if successful
    """
    bucket = bucket_name or settings.s3_bucket_name
    if not bucket:
        raise ValueError("S3 bucket name not configured")
    
    try:
        s3_client = get_s3_client()
        s3_client.delete_object(Bucket=bucket, Key=s3_key)
        return True
    except ClientError as e:
        raise Exception(f"Failed to delete from S3: {str(e)}")


async def get_s3_presigned_url(
    s3_key: str,
    expiration: int = 3600,
    bucket_name: Optional[str] = None
) -> str:
    """
    Generate a presigned URL for a recording.
    
    Args:
        s3_key: The S3 object key
        expiration: URL expiration time in seconds
        bucket_name: Optional bucket name (uses config default if not provided)
    
    Returns:
        Presigned URL
    """
    bucket = bucket_name or settings.s3_bucket_name
    if not bucket:
        raise ValueError("S3 bucket name not configured")
    
    try:
        s3_client = get_s3_client()
        url = s3_client.generate_presigned_url(
            'get_object',
            Params={'Bucket': bucket, 'Key': s3_key},
            ExpiresIn=expiration
        )
        return url
    except ClientError as e:
        raise Exception(f"Failed to generate presigned URL: {str(e)}")


