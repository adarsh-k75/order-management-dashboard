from datetime import datetime
from decimal import Decimal
from typing import Optional
from pydantic import BaseModel, Field, field_validator

class OrderBase(BaseModel):
    customer_name: str = Field(..., min_length=1, max_length=100)
    amount: Decimal = Field(..., gt=0) # Value in INR, must be greater than 0

class OrderCreate(OrderBase):
    pass

class OrderUpdateStatus(BaseModel):
    status: str

    @field_validator('status')
    @classmethod
    def validate_status(cls, value: str) -> str:
        valid_statuses = {"Pending", "Processing", "Completed", "Cancelled"}
        # Ensure status starts with uppercase or handle casing gracefully
        formatted_value = value.strip().capitalize()
        if formatted_value not in valid_statuses:
            raise ValueError(f"Status must be one of {valid_statuses}")
        return formatted_value

class OrderResponse(OrderBase):
    id: int
    status: str
    created_at: datetime
    amount_usd: Optional[Decimal] = None # Calculated dynamically

    class Config:
        from_attributes = True
