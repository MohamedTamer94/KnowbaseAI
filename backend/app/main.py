from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from app.api.v1.api import api_router
from app.config import settings

from app.db import Base, engine

import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))  # /app/backend/app
STATIC_DIR = os.path.join(BASE_DIR, "static")

app = FastAPI(title="KnowbaseAI", version="1.0.0")
app.router.redirect_slashes = False

# Standard strict CORS for the Dashboard
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.CLIENT_URL],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Custom CORS middleware for widget endpoints
@app.middleware("http")
async def widget_cors_bridge(request: Request, call_next):
    path = request.url.path
    
    # Check if this is a widget-related path
    if path.startswith("/documents/widget/"):
        # Handle Preflight (OPTIONS)
        if request.method == "OPTIONS":
            return Response(
                status_code=204,
                headers={
                    "Access-Control-Allow-Origin": request.headers.get("Origin", "*"),
                    "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
                    "Access-Control-Allow-Headers": "*",
                    "Access-Control-Allow-Credentials": "true",
                },
            )
        
        # Process the actual GET/POST request
        response = await call_next(request)
        
        # Inject headers into the response
        response.headers["Access-Control-Allow-Origin"] = request.headers.get("Origin", "*")
        response.headers["Access-Control-Allow-Credentials"] = "true"
        return response

    # For all other routes (Dashboard), let CORSMiddleware handle it
    return await call_next(request)

app.include_router(api_router)

app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")

@app.on_event("startup")
def on_startup():
    Base.metadata.create_all(bind=engine)

@app.get("/health")
def health():
    return {"status": "ok"}
