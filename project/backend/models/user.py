from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=False)
    employee_id = Column(String, unique=True, nullable=False, index = True)
    # avatar_url = Column(String)
    # google_id = Column(String, unique=True, index=True)
    is_manager = Column(Boolean, default=False)
    manager_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    # updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    manager = relationship("User", remote_side=[id], back_populates="subordinates")
    subordinates = relationship("User", back_populates="manager", cascade="all, delete-orphan")
    skills = relationship("Skill", back_populates="user", cascade="all, delete-orphan")
    # skill_submissions = relationship("SkillSubmission", back_populates="user", cascade="all, delete-orphan")
    # approved_submissions = relationship("SkillSubmission", foreign_keys="SkillSubmission.approved_by_id", back_populates="approved_by")