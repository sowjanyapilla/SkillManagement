from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime


# -------------------- Base --------------------
class UserBase(BaseModel):
    email: EmailStr
    name: str
    employee_id: str
    manager_id: Optional[int] = None


# -------------------- Create --------------------
class UserCreate(UserBase):
    pass


# -------------------- Login --------------------
class UserLogin(BaseModel):
    google_token: str


# -------------------- Response --------------------
class UserResponse(UserBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


# -------------------- Profile with Relations --------------------
class UserProfile(UserResponse):
    subordinates: List["UserResponse"] = Field(default_factory=list)
    manager: Optional["UserResponse"] = None

    class Config:
        from_attributes = True
