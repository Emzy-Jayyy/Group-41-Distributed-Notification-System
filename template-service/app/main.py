# app/main.py
from fastapi import FastAPI
from .routers import templates, keepalive
from contextlib import asynccontextmanager
from .database import init_db
from .setup_main import configure_cors

# --- SYNC LIFESPAN ---
@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Asynchronous lifespan function.
    Runs the synchronous 'init_db()' on startup.
    """
    print("Application startup... running init_db().")
    init_db()
    print("Database initialized.")
    yield

# calling an instance of fast api
app = FastAPI(
    title="Template Service",         
    description="Manages notification templates, versions, and rendering.", 
    version="1.0.0",
    lifespan=lifespan            
)

# Include your API routes
app.include_router(templates.router)
app.include_router(keepalive.router)

# defining the cors function
configure_cors(app)


# --- Main entry point to run the app for local pdevelopment---
if __name__ == "__main__":
    import uvicorn
    # Use 0.0.0.0 to be accessible inside Docker
    # Use port 3004 as requested
    uvicorn.run(app, host="0.0.0.0", port=3004)