from sqlalchemy import Column, Integer, String, Numeric, DateTime, func
from app.database.database import Base

class Order(Base):
    """SQLAlchemy model representing orders in the database."""
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    customer_name = Column(String(100), index=True, nullable=False)
    amount = Column(Numeric(10, 2), nullable=False)  # Stored in INR (precision of 2 decimal points)
    status = Column(String(20), index=True, nullable=False, default="Pending") # Pending, Processing, Completed, Cancelled
    created_at = Column(DateTime(timezone=True), index=True, server_default=func.now())
