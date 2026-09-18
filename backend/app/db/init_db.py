from app.db.session import get_engine
from app.models.base import Base
# Import all models so metadata knows all tables
import app.models  # noqa: F401


def create_tables():
    """Create all database tables."""
    engine = get_engine()
    Base.metadata.create_all(bind=engine)


def drop_tables():
    """Drop all database tables."""
    engine = get_engine()
    Base.metadata.drop_all(bind=engine)
