import os.path

from fastapi import APIRouter, Form, UploadFile, File, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm.session import Session

from app.crud.document_crud import create_document, list_documents as list_documents_crud, get_document
from app.crud.tenant_crud import get_user_tenants, tenant_has_user
from app.db import get_db
from app.dependencies.auth_dependencies import get_current_user
from app.models.document import DocumentType

from uuid import uuid4

from app.models.user import User
from app.tasks.documents import process_document, query_document

router = APIRouter()

UPLOAD_DIR = "uploaded_files"

@router.get("/")
def list_documents(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    tenant_id = current_user.current_tenant_id
    if not tenant_has_user(db, tenant_id, str(current_user.id)):
        raise HTTPException(status_code=404, detail="User doesn't have access to this tenant")
    return list_documents_crud(db, tenant_id=tenant_id)

@router.post("/upload")
def upload_document(
        background_tasks: BackgroundTasks,
        type: DocumentType = Form(...),
        file: UploadFile | None = File(None),
        source: str | None = Form(...),
        current_user: User = Depends(get_current_user),
        db: Session = Depends(get_db)
):
    filename = None
    filepath = None
    tenant_id = current_user.current_tenant_id

    if not tenant_has_user(db, tenant_id, str(current_user.id)):
        raise HTTPException(status_code=404, detail="User doesn't have access to this tenant")

    if type != DocumentType.website:
        if not file:
            raise HTTPException(status_code=400, detail="File is required for this type")
        filename = file.filename
        filepath = os.path.join(UPLOAD_DIR, f"{uuid4()}_{filename}")
        with open(filepath, "wb") as f:
            f.write(file.file.read())
    else:
        if not source:
            raise HTTPException(status_code=400, detail="Source is required for this type")
    doc = create_document(db,
                          tenant_id=tenant_id,
                          uploaded_by=str(current_user.id),
                          filename=filename,
                          filepath=filepath,
                          doc_type=type,
                          source=source)
    background_tasks.add_task(process_document, db, doc)
    return {"message": "Document uploaded", "document_id": str(doc.id)}

@router.post("/query")
def ask_query(query: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    tenant_id = current_user.current_tenant_id
    if not tenant_has_user(db, tenant_id, str(current_user.id)):
        raise HTTPException(status_code=404, detail="User doesn't have access to this tenant")
    result = query_document(tenant_id, query)
    for source in result["sources"]:
        source["document"] = get_document(db, source["document_id"])
    return result