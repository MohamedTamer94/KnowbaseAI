from sqlalchemy.orm import Session, joinedload
from sqlalchemy.sql.functions import func

from app.models.document import Document
from app.models.tenant import Tenant
from app.models.user import User
from app.models.user_tenant import UserTenant


def create_tenant(db: Session, name: str, user_id: str):
    tenant = Tenant(name=name)
    db.add(tenant)
    db.commit()
    db.refresh(tenant)
    add_user_to_tenant(db, user_id, tenant.id, "admin")
    return tenant

def get_user_first_tenant(db: Session, user: User) -> UserTenant | None:
    return db.query(UserTenant)\
            .filter(UserTenant.user_id == user.id)\
            .order_by(UserTenant.created_at.asc())\
            .first()

def get_user_tenants(db: Session, user_id: str) -> list | None:
    return (db.query(UserTenant)
            .options(joinedload(UserTenant.tenant))
            .filter(UserTenant.user_id == user_id)
            .all())

def tenant_has_user(db: Session, tenant_id: str, user_id: str) -> UserTenant | None:
    return (db.query(UserTenant)
            .filter(UserTenant.tenant_id == tenant_id, UserTenant.user_id == user_id)
            .first())

def get_tenant(db: Session, tenant_id: str) -> Tenant | None:
    return (db.query(Tenant)
            .filter(Tenant.id == tenant_id)
            .first())

def get_tenant_with_stats(db: Session, tenant_id: str):
    result = (
        db.query(
            Tenant,
            func.count(UserTenant.user_id).label("user_count"),
            func.count(Document.id).label("document_count"),
        )
        .outerjoin(UserTenant, UserTenant.tenant_id == Tenant.id)
        .outerjoin(Document, Document.tenant_id == Tenant.id)
        .filter(Tenant.id == tenant_id)
        .group_by(Tenant.id)
        .first()
    )

    if not result:
        return None

    tenant, user_count, document_count = result
    print(tenant, user_count, document_count)

    return {
        "id": tenant.id,
        "name": tenant.name,
        "created_at": tenant.created_at,
        "user_count": user_count,
        "document_count": document_count,
    }

def add_user_to_tenant(db: Session, user_id: str, tenant_id: str, role: str = "member") -> UserTenant:
    user_tenant = UserTenant(user_id=user_id, tenant_id=tenant_id, role=role)
    db.add(user_tenant)
    db.commit()
    db.refresh(user_tenant)
    return user_tenant

def remove_user_from_tenant(db: Session, user_id: str, tenant_id: str) -> UserTenant:
    user_tenant = db.query(UserTenant).filter(UserTenant.user_id == user_id,
                                              UserTenant.tenant_id == tenant_id).first()
    if user_tenant:
        db.delete(user_tenant)
        db.commit()
    return user_tenant
