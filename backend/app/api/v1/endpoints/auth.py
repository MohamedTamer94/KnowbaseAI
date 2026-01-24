from typing import Annotated

from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.crud.tenant_crud import create_tenant, get_user_first_tenant
from app.crud.user_crud import get_user_by_email, create_user, authenticate_user
from app.db import get_db
from app.models.user_tenant import UserTenant
from app.schemas.user import UserRead, UserCreate, Token
from app.utils.jwt import create_access_token

router = APIRouter()

@router.post("/register", response_model=UserRead)
async def register(user: UserCreate, db: Session = Depends(get_db)):
    existing = get_user_by_email(db, email=user.email)
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    print(user.password)
    db_user = create_user(db, email=user.email, password=user.password, name=user.name)

    create_tenant(db, name=f"{user.name}'s workspace", user_id=str(db_user.id))
    return db_user

@router.post("/login", response_model=Token)
async def login(form_data: Annotated[OAuth2PasswordRequestForm, Depends()], db: Session = Depends(get_db)):
    db_user = authenticate_user(db, email=form_data.username, password=form_data.password)
    if not db_user:
        raise HTTPException(status_code=400, detail="Incorrect email or password")
    # Find first tenant
    tenant = get_user_first_tenant(db, db_user)
    token_data = {"user_id": str(db_user.id), "tenant_id": str(tenant.tenant_id)}
    token = create_access_token(token_data)
    return {"access_token": token, "token_type": "bearer"}