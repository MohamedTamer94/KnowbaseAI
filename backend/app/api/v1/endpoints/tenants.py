from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm.session import Session

from app.crud.tenant_crud import get_user_tenants, add_user_to_tenant, \
    remove_user_from_tenant as remove_user_from_tenant_crud, tenant_has_user, get_tenant_with_stats
from app.db import get_db
from app.dependencies.auth_dependencies import get_current_user
from app.models.user import User
from app.schemas.tenant import CreateTenant, Tenant
from app.crud.tenant_crud import create_tenant as create_tenant_crud, get_tenant as get_tenant_crud

router = APIRouter()

@router.get("/", response_model=list)
def list_user_tenants(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    user_tenants = get_user_tenants(db, str(current_user.id))
    return [{"tenant_id": str(ut.tenant_id), "role": ut.role, "name": ut.tenant.name} for ut in user_tenants]

@router.post("/", response_model=Tenant)
def create_tenant(tenant: CreateTenant, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    new_tenant = create_tenant_crud(db, tenant.name, str(current_user.id))
    return {"id": new_tenant.id, "name": new_tenant.name, "created_at": new_tenant.created_at}

@router.get("/current")
def get_tenant(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    tenant_id = current_user.current_tenant_id
    if not tenant_has_user(db, tenant_id, str(current_user.id)):
        raise HTTPException(status_code=404, detail="User doesn't have access to this tenant")
    tenant = get_tenant_with_stats(db, current_user.current_tenant_id)
    if not tenant:
        raise HTTPException(status_code=404, detail="Tenant not found")
    return tenant


# Invite user to tenant (admin only)
@router.post("/invite/")
def invite_user_to_tenant(email: str, current_user: User = Depends(get_current_user),
                          db: Session = Depends(get_db)):
    # Check if current_user is admin of tenant
    tenant_id = current_user.current_tenant_id
    user_tenant = tenant_has_user(db, tenant_id, str(current_user.id))
    if not user_tenant:
        raise HTTPException(status_code=404, detail="User doesn't have access to this tenant")
    role = user_tenant.role
    if role != "admin":
        raise HTTPException(status_code=403, detail="Only admins can invite users")

    # Check if user exists
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Add to tenant
    add_user_to_tenant(db, str(user.id), tenant_id)
    return {"message": f"{email} added to tenant {tenant_id}"}


# Remove user from tenant (admin only)
@router.post("/remove")
def remove_user_from_tenant(email: str, current_user: User = Depends(get_current_user),
                            db: Session = Depends(get_db)):
    # Check if current_user is admin of tenant
    tenant_id = current_user.current_tenant_id
    user_tenant = tenant_has_user(db, tenant_id, str(current_user.id))
    if not user_tenant:
        raise HTTPException(status_code=404, detail="User doesn't have access to this tenant")
    role = user_tenant.role
    if role != "admin":
        raise HTTPException(status_code=403, detail="Only admins can remove users")

    # Find user to remove
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    remove_user_from_tenant_crud(db, str(user.id), tenant_id)
    return {"message": f"{email} removed from tenant {tenant_id}"}