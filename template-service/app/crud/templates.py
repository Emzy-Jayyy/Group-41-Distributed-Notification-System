# app/crud.py
from ..database import redis_client
from ..models.templates import Template, TemplateVersion
from sqlmodel import select, and_, update
from ..utils.templates import render_template_string
from fastapi import HTTPException, status


def get_template_by_key(db, template_key):
    """
    Fetches a single template by its unique template_key.
    """
    try:
        statement  = select(Template).where(Template.template_key == template_key)
        result = db.execute(statement)
        single_template = result.scalars().first()
        if not single_template:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Template with key '{template_key}' not found")
        return single_template
    except HTTPException as http_exc:
        raise http_exc
    except Exception as e:
        return HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching template: {e}")


def create_template(db, template):
    """ Creates a new template entry in the database."""
    try:
        statement  = select(Template).where(Template.template_key == template.template_key)
        result = db.execute(statement)
        existing_template = result.scalars().first()
        if existing_template:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Template with key '{template.template_key}' already exists")
        new_template = Template(
            template_key=template.template_key,
            description=template.description
        )
        db.add(new_template)
        db.commit()
        db.refresh(new_template)
        return new_template
    except HTTPException as http_exc:
        raise http_exc
    except Exception as e:
        return HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error creating template: {e}")


def create_template_version(db, template_key, version):
    try:
        db_template = get_template_by_key(db, template_key)
        # Find current max version and increment
        statement_version = select(TemplateVersion).where(TemplateVersion.template_id == db_template.id).order_by(TemplateVersion.version.desc())
        result_version = db.execute(statement_version)
        current_max_version = result_version.scalars().first()
        
        next_version = (current_max_version.version + 1) if current_max_version else 1
        
        db_version = TemplateVersion(
            content=version.content,
            language=version.language,
            version=next_version,
            is_active=False, # New versions are not active by default
            template_id=db_template.id
        )
        db.add(db_version)
        db.commit()
        db.refresh(db_version)
        return db_version
    except HTTPException as http_exc:
        raise http_exc
    except Exception as e:
        return HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error creating template version: {e}")
    
def activate_single_template_version(template_key, version, db):
    """
    Activates a specific version of a template.
    Deactivates any other active versions for that template.
    """
    try:
        
        
        # Deactivate other versions
        # for v in db_template.versions:
        #     v.is_active = (v.version == version)
        
        # db.commit()
        db_template = get_template_by_key(db, template_key)
        #find the version to activate
        statement = select(TemplateVersion).where(
            TemplateVersion.template_id == db_template.id,
            TemplateVersion.id == version
        )
        result = db.execute(statement)
        db_version = result.scalars().first()
        
        if not db_version:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Version '{version}' for template '{template_key}' not found")
        # 2. Get its language and template_id for the "smart" update
        lang_to_update = db_version.language
        #template_id_to_update = db_version.id

        # Deactivate all versions
        statement = update(TemplateVersion).where(and_(TemplateVersion.template_id == db_template.id,
            TemplateVersion.language == lang_to_update,
            TemplateVersion.is_active == True)).values(is_active = False)   
        deactivate_all_versions = db.execute(statement)

        # 4. Activate the target version
        db_version.is_active = True
        db.add(db_version)

        # 5. Commit both changes
        try:
            db.commit()
            db.refresh(db_version)
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Database error: {e}"
            )

        # 6. IMPORTANT: Clear the cache for this specific template/language
        if redis_client:
            cache_key = f"template:{template_key}:{lang_to_update}:active"
            redis_client.delete(cache_key)

        return {"message": f"Template '{template_key}' version '{version}' activated successfully."}
    
    except HTTPException as http_exc:
        raise http_exc
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error activating template version: {e}")
    


def _query_active_template_from_db(db, template_key, language) -> str | None:
    """Helper function to query the database for the active template."""
    try:
        statement = select(TemplateVersion.content).join(Template).where(and_(
            Template.template_key == template_key,
            TemplateVersion.language == language,
            TemplateVersion.is_active == True
        ))
        result = db.execute(statement)   
        content = result.scalars().first()
        if not content:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Active template not found for key '{template_key}' and language '{language}'" )
        return content
    except HTTPException as http_exc:
        raise http_exc
    

def get_active_template_content(db, template_key, language) -> str | None:
    """
    Fetches the active template content.
    1. Check Redis Cache
    2. If miss, query DB and populate cache
    """
    try:
        if not redis_client:
            # Fallback if Redis is down
            return _query_active_template_from_db(db, template_key, language)

        # 1. Check Cache
        cache_key = f"template:{template_key}:{language}:active"
        cached_content = redis_client.get(cache_key)
        
        if cached_content:
            return cached_content

        # 2. Cache Miss: Query DB
        content = _query_active_template_from_db(db, template_key, language)
        
        # 3. Populate Cache
        if content:
            redis_client.set(cache_key, content, ex=3600) # Cache for 1 hour
            
        return content
    except HTTPException as http_exc:
        raise http_exc


def render_template_internal(template_key, request, db):
    """
    Internal function to render a template.
    Used by the API endpoint.
    """
    try:
        content = get_active_template_content(db, template_key, request.language)
        if not content:
            raise HTTPException(
                status_code=404, 
                detail=f"Active template not found for key '{template_key}' and language '{request.language}'"
            )
        
        response = render_template_string(content, request.variables)
        return {
            "rendered_content": response
            }
    except HTTPException as http_exc:
        raise http_exc

def delete_template_and_version(template_key: str, version: str, db):
    try:
        db_template = get_template_by_key(db, template_key)
        statement = select(TemplateVersion).where(
            TemplateVersion.template_id == db_template.id,
            TemplateVersion.id == version
        )
        result = db.execute(statement)
        db_version = result.scalars().first()
        if not db_version:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Version '{version}' for template '{template_key}' not found"
            )
        db.delete(db_version)
        db.commit()
        return
    except HTTPException as httpexc:
        raise httpexc
    
def delete_template_and_all_versions(template_key, db):
    try:
        db_template = get_template_by_key(db, template_key)
        db.delete(db_template)
        db.commit()
        return
    except HTTPException as httpexc:
        raise httpexc