# Template Service (Notification System)

This service is a core component of the microservice-based Notification System. It acts as a central repository for managing and rendering all notification templates.

Its primary role is to provide a single source of truth for template content. Other services (like the Email Service or Push Service) will query this service to fetch the correct, active template for a specific language, render it with user-specific variables, and then send the final content.

## Features

1. Template Management: Create, read, and delete template "groups" (e.g., welcome_email).

2. Versioning: Store multiple, distinct versions for each template. This allows for content updates without breaking existing systems and provides a version history.

3. Multi-language Support: Each template version is tied to a language code (e.g., en, en-us, fr), allowing for full internationalization.

4. Activation: A specific version can be set as "active" for its given language.

5. Dynamic Rendering: Uses Jinja2 to render templates, substituting variables like {{name}} or {{link}} with data provided at request time.

6. High-Performance Caching: All active templates are cached in Redis to ensure extremely fast render times and reduce database load.

7. Health Check: Provides a /health endpoint for monitoring and service discovery.

## Tech Stack

1. Framework: FastAPI

2. Database: PostgreSQL

3. ORM: SQLModel (combines Pydantic and SQLAlchemy)

4. Cache: Redis

5. Templating: Jinja2

## Containerization: Docker

-  Getting Started

1. Local Setup (Virtual Environment)

- Clone the repository: 
    - git clone <https://github.com/ACSP-Tech/distributed-notification-system-template-service.git> 
    - cd template-service

- Create and activate a virtual environment:

    - python -m venv venv
    -  venv/bin/activate  # 
    - On Windows: venv\scripts\activate



- Install dependencies:

    - pip install -r requirements.txt



- Create your .env file:
    - Copy the .env.example to .env and fill in the values.
    - databasebase url
    - redis host
    - redis port

- Run the service:
    - The app will be available at http://localhost:3004.

    - uvicorn app.main:app --host 0.0.0.0 --port 3004 --reload



2. Local Setup (Docker)

This is the recommended way to run the service locally as it mirrors the production environment (including the database and cache).

- Create your .env file (as shown above).

- Build and run with Docker Compose:

- docker-compose up --build



- The service will be available at http://localhost:3004.

##  Environment Variables

The service is configured using an .env file in the root directory.

- DATABASE_URL

The full connection string for your PostgreSQL database.

    - postgresql://user:pass@host:port/db

- REDIS_HOST

The hostname of your Redis cache instance.

    - my-redis-instance.com

- REDIS_PORT

The port for your Redis cache.

    - 16387

- REDIS_PASSWORD

    - The password for your Redis cache.



##  API Endpoints

All endpoints are prefixed with /api/v1. Naming conventions are snake_case.



- POST/templates: Creates a new template group (e.g., welcome_email). TemplateBase 201 Created - Template

- GET: /templates/{template_key} Gets a template's base information (does not include versions). (None) 200 OK - TemplateRead

- DELETE /templates/{template_key} : Deletes a template and all its associated versions.(None)204 No Content


- POST /templates/versions/{template_key}: Adds a new content version to an existing template. TemplateVersionBase 201 Created - TemplateVersion

- PUT /templates/versions/{template_key= : Activates a specific version by its ID. The version ID must be passed as a query parameter.(None) 200 OK (Message)

- DELETE /templates/versions/{template_key}: Deletes a specific version by its ID. The version ID must be passed as a query parameter.
(None)
204 No Content

Example PUT (Activation) Request:
PUT http://localhost:3004/api/v1/templates/versions/welcome_email?version=b7e4a6d0-2b1a-4b9e-9b0d...

### Rendering (Main Endpoint)

This is the primary endpoint for other microservices.

- POST /render/{template_key} : Renders the active template for a given language with variables. RenderRequest 200 OK - RenderResponse
Example RenderRequest Body:

>
{
  "language": "en",
  "variables": {
    "name": "Precious",
    "order_id": 12345
  }
}


Example RenderResponse Body:
>
{
  "rendered_content": "<h1>Hello Precious!</h1><p>Your order #12345 is confirmed.</p>"
}




- Health Check: GET/health
A simple endpoint to confirm the service is running.

## workflow

1. Creating and Activating a Template

To make a template available for rendering, you must perform 3 steps:

- Create the Group: POST /api/v1/templates

    - { "template_key": "welcome_email", "description": "Email for new users" }



- Add a Version: POST /api/v1/templates/        
    - versions/welcome_email
This will create a version with a new unique ID (e.g., abc-123).

{
  "content": "<h1>Hello {{name}}!</h1>",
  "language": "en"
}



- Activate the Version: PUT /api/v1/templates/  
    - versions/welcome_email?version=abc-123
This clears the Redis cache and marks this version as is_active=True.

2. Rendering a Template

Once a template is activated, the Email Service can call the render endpoint:

- Call Render: POST /api/v1/render/welcome_email

{
  "language": "en",
  "variables": { "name": "Alice" }
}



Get Response:

{
  "rendered_content": "<h1>Hello Alice!</h1>"
}

