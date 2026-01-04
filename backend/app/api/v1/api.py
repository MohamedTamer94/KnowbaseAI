from fastapi import APIRouter
from app.api.v1.endpoints.auth import router as auth_router
from app.api.v1.endpoints.users import router as users_router
from app.api.v1.endpoints.tenants import router as tenants_router
from app.api.v1.endpoints.documents import router as documents_router

api_router = APIRouter()

api_router.include_router(auth_router, prefix="/auth", tags=["auth"])
api_router.include_router(users_router, prefix="/users", tags=["users"])
api_router.include_router(tenants_router, prefix="/tenants", tags=["tenants"])
api_router.include_router(documents_router, prefix="/documents", tags=["documents"])
