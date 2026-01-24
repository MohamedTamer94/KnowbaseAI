from fastapi import APIRouter, Depends, HTTPException
from requests import Session

from app.crud.embed_widget_crud import create_embed_widget, delete_embed_widget, list_tenant_widgets, update_embed_widget
from app.models.user import User
from app.db import get_db
from app.crud.tenant_crud import tenant_has_user
from app.dependencies.auth_dependencies import get_current_user
from app.schemas.widgets import CreateWidgetRequest

router = APIRouter()

@router.get("/")
def read_widgets(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    tenant_id = current_user.current_tenant_id
    if not tenant_has_user(db, tenant_id, str(current_user.id)):
        raise HTTPException(status_code=404, detail="User doesn't have access to this tenant")
    return list_tenant_widgets(db, tenant_id=tenant_id)

@router.post("/")
def create_widget(payload: CreateWidgetRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    tenant_id = current_user.current_tenant_id
    user_tenant = tenant_has_user(db, tenant_id, str(current_user.id))
    if not user_tenant:
        raise HTTPException(status_code=404, detail="User doesn't have access to this tenant")
    
    # Check admin role
    if user_tenant.role != 'admin':
        raise HTTPException(status_code=403, detail="Only admins can create widgets")

    return create_embed_widget(
        db,
        tenant_id=tenant_id,
        name=payload.name,
        allowed_domains=payload.allowed_domains
    )

@router.delete("/{widget_id}")
def delete_widget(widget_id: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    tenant_id = current_user.current_tenant_id
    user_tenant = tenant_has_user(db, tenant_id, str(current_user.id))
    if not user_tenant:
        raise HTTPException(status_code=404, detail="User doesn't have access to this tenant")
    
    # Check admin role
    if user_tenant.role != 'admin':
        raise HTTPException(status_code=403, detail="Only admins can delete widgets")
    
    delete_embed_widget(db, widget_id)
    return {"message": "Widget deleted"}

@router.put("/{widget_id}")
def update_widget(widget_id: str, payload: CreateWidgetRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    tenant_id = current_user.current_tenant_id
    user_tenant = tenant_has_user(db, tenant_id, str(current_user.id))
    if not user_tenant:
        raise HTTPException(status_code=404, detail="User doesn't have access to this tenant")
    
    # Check admin role
    if user_tenant.role != 'admin':
        raise HTTPException(status_code=403, detail="Only admins can update widgets")
    
    update_embed_widget(db, widget_id, payload.name, payload.allowed_domains)
    return {"message": "Widget updated"}