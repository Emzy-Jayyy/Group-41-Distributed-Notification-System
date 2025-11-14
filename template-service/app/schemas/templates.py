# app/schemas.py
from pydantic import BaseModel, Field, field_validator
from typing import Optional, Dict, Any
from datetime import datetime
from fastapi import HTTPException, status

#make inputation case insensitive
# --- Template Version Schemas ---
class TemplateVersionBase(BaseModel):
    content: str
    language: str
    @field_validator('content')
    @classmethod
    def validate_content(cls, v: str) -> str:
        """
        Validates the content:
        1. Strips whitespace.
        2. Ensures it is NOT an empty string after stripping.
        """
        v_stripped = v.strip()
        if not v_stripped:
            # Pydantic models raise ValueError for invalid data
            raise ValueError("content cannot be empty or just whitespace")
        return v_stripped
    
    @field_validator('language')
    @classmethod
    def validate_language(cls, v: str) -> str:
        """
        Validates the language:
        1. Strips whitespace.
        2. Converts to lowercase.
        3. Ensures it is NOT an empty string after stripping.
        """
        # v is guaranteed to be a string
        v_stripped = v.strip().lower()
        
        if not v_stripped:
            # An empty language code is invalid
            raise ValueError("language cannot be empty or just whitespace")
            
        return v_stripped

# class TemplateVersionCreate(TemplateVersionBase):
#     pass


class TemplateVers(TemplateVersionBase):
    id: str #placehoder to come back
    version: int
    is_active: bool
    created_at: datetime
    updated_at: datetime
    template_id: str

    class Config:
        from_attributes = True # Replaced orm_mode

# --- Template Schemas ---
class TemplateBase(BaseModel):
    template_key: str
    description: Optional[str] = None
    @field_validator('template_key')
    @classmethod
    def validate_template_key(cls, v: str) -> str:
        """
        Validates the template_key:
        1. Strips whitespace.
        2. Converts to lowercase.
        3. Ensures it is NOT an empty string after stripping.
        """
        # v is guaranteed to be a str (not None) because the field is `str`
        v_stripped = v.strip()
        
        if not v_stripped:
            # This check catches "" and "   "
            raise ValueError("template_key cannot be empty or just whitespace")
            
        return v_stripped.lower()

    @field_validator('description')
    @classmethod
    def validate_description(cls, v: Optional[str]) -> Optional[str]:
        """
        Validates the description:
        1. Strips whitespace.
        2. Converts to lowercase.
        3. Allows it to be None or an empty string.
        """
        if isinstance(v, str):
            # It's fine if description becomes "" after stripping
            return v.strip().lower()
            
        # Return v directly if it's None
        return v

# class TemplateCreate(TemplateBase):
#     pass


class Template(TemplateBase):
    id: str
    template_key: str
    description: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    # versions: list[TemplateVersion] = []

    class Config:
        from_attributes = True


class TemplateRead(TemplateBase):
    id: str
    template_key: str
    description: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    versions: list[TemplateVers] = []

    class Config:
        from_attributes = True      

# --- Rendering Schemas ---
class RenderRequest(BaseModel):
    language: str = "en"
    variables: Dict[str, Any]

class RenderResponse(BaseModel):
    rendered_content: str