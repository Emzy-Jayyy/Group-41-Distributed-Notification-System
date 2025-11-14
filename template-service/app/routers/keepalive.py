from fastapi import APIRouter, Depends, status
from ..database import get_db
from sqlalchemy import text


router = APIRouter()

# --- Required Health Check ---
@router.get("/", status_code=status.HTTP_200_OK, tags=["Health"])
def health_check():
    """
    Simple health check endpoint for monitoring.
    """
    return {"status": "ok"}

@router.get("/internal/keepalive", status_code=status.HTTP_200_OK, tags=["db keepalive"])
def keepalive(session=Depends(get_db)):
    """Internal endpoint to keep the DB connection alive."""
    session.execute(text("SELECT 1"))
    return {"ok": True}


