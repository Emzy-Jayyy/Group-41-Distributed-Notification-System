# app/models.py
from sqlmodel import SQLModel, Field, Relationship
from sqlalchemy import Column, DateTime, Text, func, String, Integer, Boolean, text
from datetime import datetime
from typing import Optional, List
import uuid

class TemplateVersion(SQLModel, table=True):
    """
    Stores a specific version of a template, including its content and language.
    """
    __tablename__ = "template_versions"

    # Columns from original, converted to SQLModel fields
    id: str = Field(
    default_factory=lambda: str(uuid.uuid4()),
    sa_column=Column(String(36), primary_key=True)
    )
    template_id: str = Field(foreign_key="templates.id")
    content: str = Field(sa_column=Column(Text, index=True))
    language: str = Field(sa_column=Column(String, index=True))
    version: int = Field(default= 1, sa_column=Column(Integer, index=True))
    is_active: bool = Field(default=False, sa_column=Column(Boolean, server_default=text("false"), index=True))
    created_at: datetime = Field(sa_column=Column(DateTime(timezone=True), server_default=func.now()))
    updated_at: datetime = Field(sa_column=Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now()))
    # Relationship
    template: Optional["Template"] = Relationship(back_populates="versions")


class Template(SQLModel, table=True):
    """
    Represents a unique template, like 'welcome_email' or 'password_reset'.
    This table just groups all the versions together.
    """
    __tablename__ = "templates"

    # Columns
    id: str = Field(
    default_factory=lambda: str(uuid.uuid4()),
    sa_column=Column(String(36), primary_key=True)
    )
    template_key: str = Field(sa_column=Column(String, unique=True, index=True))
    description: Optional[str] = Field(default=None, sa_column=Column(String))
    created_at: datetime = Field(sa_column=Column(DateTime(timezone=True), server_default=func.now()))
    updated_at: datetime = Field(sa_column=Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now()))
    # Relationships
    # This links to all its versions
    versions: List["TemplateVersion"] = Relationship(
        back_populates="template",
        sa_relationship_kwargs={
            "cascade": "all, delete-orphan"
        }
    )