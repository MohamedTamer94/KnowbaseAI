
from uuid import uuid4
from app.models.embed_widget import EmbedWidget

def get_widget_by_token(db, token: str):
    return db.query(EmbedWidget).filter(
        EmbedWidget.public_token == token
    ).first()

def list_tenant_widgets(db, tenant_id: str):
    return db.query(EmbedWidget).filter(
        EmbedWidget.tenant_id == tenant_id
    ).all()

def create_embed_widget(db, tenant_id: str, name: str, allowed_domains: list[str]):
    token = uuid4()
    widget = EmbedWidget(
        tenant_id=tenant_id,
        name=name,
        allowed_domains=allowed_domains,
        public_token=str(token)
    )
    db.add(widget)
    db.commit()
    db.refresh(widget)
    return widget

def delete_embed_widget(db, id: str):
    widget = db.query(EmbedWidget).filter(EmbedWidget.id == id).first()
    db.delete(widget)
    db.commit()

def update_embed_widget(db, widget_id: str, name: str, allowed_domains: list[str]):
    widget = db.query(EmbedWidget).filter(EmbedWidget.id == widget_id).first()
    if not widget:
        return None
    widget.name = name
    widget.allowed_domains = allowed_domains
    db.commit()
    db.refresh(widget)
    return widget