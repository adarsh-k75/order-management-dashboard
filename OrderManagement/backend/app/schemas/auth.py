from typing import Optional, Any
from pydantic import BaseModel

class UserLogin(BaseModel):
    username: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"

class TokenData(BaseModel):
    username: Optional[str] = None

class UserOut(BaseModel):
    id: int
    username: str

    class Config:
        from_attributes = True

# Standard Generic API Response Schema to wrap output
class APIResponse(BaseModel):
    success: bool
    message: str
    data: Optional[Any] = None
