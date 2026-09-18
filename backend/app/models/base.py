from datetime import datetime, timezone
from sqlalchemy.orm import declarative_base

Base = declarative_base()

def utc_now() -> datetime:
    """Returns current UTC timestamp."""
    return datetime.now(timezone.utc)
