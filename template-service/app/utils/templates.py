from jinja2 import Environment, BaseLoader
from ..models.templates import Template, TemplateVersion
from fastapi import HTTPException, status

# Setup Jinja2 environment to render strings
jinja_env = Environment(loader=BaseLoader())

def render_template_string(content: str, variables: dict) -> str:
    """Uses Jinja2 to substitute variables in a template string."""
    try:
        template = jinja_env.from_string(content)
        return template.render(variables)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={"message": f"Error rendering template: {e}"})


