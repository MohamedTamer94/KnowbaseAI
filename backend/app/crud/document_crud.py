from sqlalchemy.orm.session import Session

from app.models.document import DocumentType, Document


def create_document(db: Session, tenant_id: str, uploaded_by: str,
                    filename: str, filepath: str, doc_type: DocumentType, source: str):
    document = Document(tenant_id=tenant_id, filename=filename, filepath=filepath, type=doc_type,
                        source=source, uploaded_by=uploaded_by)
    db.add(document)
    db.commit()
    db.refresh(document)
    return document

def list_documents(db: Session, tenant_id: str):
    return db.query(Document).filter(Document.tenant_id == tenant_id).all()

def update_document_status(db: Session, document: Document, status: str):
    document.status = status
    db.commit()
    db.refresh(document)

def get_document(db: Session, document_id: str):
    return db.query(Document).filter(Document.id == document_id).one_or_none()

def update_document_name(db: Session, document: Document, new_filename: str):
    document.filename = new_filename
    db.commit()
    db.refresh(document)
    return document

def delete_document(db: Session, document: Document):
    db.delete(document)
    db.commit()