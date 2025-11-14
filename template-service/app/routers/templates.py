# app/routers/templates.py
from fastapi import APIRouter, Depends, HTTPException, status
from ..database import get_db
from ..crud.templates import create_template, create_template_version, get_template_by_key, activate_single_template_version, render_template_internal, delete_template_and_version, delete_template_and_all_versions
from ..schemas.templates import Template, TemplateBase, TemplateVers, TemplateVersionBase, TemplateRead, RenderResponse, RenderRequest

router = APIRouter(
    prefix="/api/v1",
    tags=["templates"]
)

@router.post("/templates", response_model = Template, status_code = status.HTTP_201_CREATED)
def create_new_template(template:TemplateBase, db = Depends(get_db)):
    """
    Creates a new template "group" (e.g., "welcome_email").
    - Args: takes in template_key and optional description.
        - template_key: str - Unique identifier for the template.
        - description: Optional[str] - A brief description of the template. Defaults to None.
    - Returns: the created Template object.
    - Raises: 409 HTTPException if template_key already exists. and 500 for other errors., 422 for pydantic validation errors
    """
    try:
        return create_template(db, template)
    except HTTPException as http_exc:
        raise http_exc
    except Exception as e:   
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error creating template: {e}"
        )

@router.post("/templates/versions/{template_key}", response_model=TemplateVers, status_code= status.HTTP_201_CREATED)
def create_new_template_version(template_key: str, version:TemplateVersionBase, db = Depends(get_db)):
    """
    Adds a new version to an existing template.
    -Args:
        - template_key: str - The unique key of the template to which the version will be added.
        - version: TemplateVersionBase 
            - The version details including content and language.
    - Returns: The created TemplateVersion object.
    - Raises:
        - 404 if template_key not found.
        - 422 for pydantic validation errors
        - 500 for other errors
    """
    try:
        return create_template_version(db, template_key, version)
    except HTTPException as http_exc:
        raise http_exc
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error creating template version: {e}"
        )

@router.get("/templates/{template_key}", response_model=TemplateRead, status_code=status.HTTP_200_OK)
def get_template(template_key: str, db = Depends(get_db)):
    """
    Fetches a template by its unique template_key.
    - Rasises 404 if not found. 500 for other errors.
    - Returns the Template object with all its versions.
    - taken template_key as path parameter
    """
    try:
        return get_template_by_key(db, template_key)
    except HTTPException as http_exc:
        raise http_exc
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching template: {e}"
        )

@router.put("/templates/versions/{template_key}", status_code=status.HTTP_200_OK)
def activate_template_version(template_key: str, version: str, db = Depends(get_db)):
    """
    Activates a specific version of a template.
    - Deactivates any other active versions for that template.
    - Raises 404 if template or version not found. 500 for other errors.
    - Returns a success message upon activation.
    """
    try:
        return activate_single_template_version(template_key, version, db)
    except HTTPException as http_exc:
        raise http_exc
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error activating template version: {e}"
        )

@router.post("/render/{template_key}", response_model=RenderResponse, status_code=status.HTTP_200_OK)
def render_template(template_key: str, request: RenderRequest, db = Depends(get_db)):
    """
    **This is the main endpoint your other services will use**
    - It fetches the active template, substitutes variables, and returns the result.
    - Raises 404 if active template not found. 500 for other errors.
    - Args:
        - template_key: str - The unique key of the template to render.
        - request: RenderRequest - The request body containing language and variables for substitution.
    - Returns: RenderResponse containing the rendered content.
    """
    try:
        return render_template_internal(template_key, request, db)
    except HTTPException as http_exc:
        raise http_exc
    except Exception as e:
        raise HTTPException(
            status_code=500, 
            detail=f"Error rendering template: {e}"
        )

@router.delete("/templates/versions/{template_key}", status_code=status.HTTP_204_NO_CONTENT)
def delete_template_version(template_key: str, version: str, db = Depends(get_db)):
    """
    Deletes a specific version of a template.
    Raises 404 if template or version not found.
    - args:
        - template_key: str - The unique key of the template.
        - NB: **Version here refers to the templateversion ID, not the language or content.**
    """
    try:
        return delete_template_and_version(template_key, version, db)
    except HTTPException as http_exc:
        raise http_exc
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error deleting template version: {e}"
        )
    
@router.delete("/templates/{template_key}", status_code=status.HTTP_204_NO_CONTENT)
def delete_template(template_key: str, db = Depends(get_db)):
    """
    Deletes a template and all its versions by template_key.
    Raises 404 if template not found.
    """
    try:
        return delete_template_and_all_versions(template_key, db)
    except HTTPException as http_exc:
        raise http_exc
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error deleting template: {e}"
        )