from fastapi import APIRouter, Depends

from app.dependencies.auth_dependencies import get_current_user
from app.schemas.user import UserRead

router = APIRouter()

@router.get("/me", response_model=UserRead)
def get_my_info(current_user = Depends(get_current_user)):
    return {
        "id": current_user.id,
        "email": current_user.email,
        "name": current_user.name,
        "created_at": current_user.created_at,
        "current_tenant_id": current_user.current_tenant_id,
    }