import os.path

from fastapi import APIRouter, Form, Request, UploadFile, File, Depends, HTTPException, BackgroundTasks
from fastapi.responses import StreamingResponse
from sqlalchemy.orm.session import Session

from app.crud.document_crud import create_document, list_documents as list_documents_crud, get_document, update_document_name, delete_document
from app.crud.tenant_crud import get_user_tenants, tenant_has_user
from app.db import get_db
from app.dependencies.auth_dependencies import get_current_user
from app.models.document import DocumentType

from uuid import uuid4

from app.models.user import User
from app.tasks.documents import delete_document_vectors, process_document, query_document_stream, process_website
from app.utils.types import get_type
from app.dependencies.chat_sessions import get_or_create_session, get_session_by_id
from app.crud.chat_crud import load_all_messages
from app.schemas.query import QueryRequest, WidgetQueryRequest
from app.schemas.document import DocumentNewName
from app.crud.embed_widget_crud import get_widget_by_token
from app.utils.validate_origin import validate_origin
from app.utils.rate_limiter import RateLimiter

embed_rate_limiter = RateLimiter(
    max_requests=20,
    window_seconds=60
)

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
        file: UploadFile | None = File(None),
        current_user: User = Depends(get_current_user),
        db: Session = Depends(get_db)
):
    filename = None
    filepath = None
    tenant_id = current_user.current_tenant_id

    if not tenant_has_user(db, tenant_id, str(current_user.id)):
        raise HTTPException(status_code=404, detail="User doesn't have access to this tenant")

    if not file:
        raise HTTPException(status_code=400, detail="File is required for this type")
    filename = file.filename
    filepath = os.path.join(UPLOAD_DIR, f"{uuid4()}_{filename}")
    with open(filepath, "wb") as f:
        f.write(file.file.read())
    type = get_type(file.content_type)
    print(f"Determined document type: {type}")
    doc = create_document(db,
                          tenant_id=tenant_id,
                          uploaded_by=str(current_user.id),
                          filename=filename,
                          filepath=filepath,
                          doc_type=type,
                          source="")
    background_tasks.add_task(process_document, db, doc)
    return {"message": "Document uploaded", "document_id": str(doc.id)}

@router.post("/crawl")
def crawl_website(
        background_tasks: BackgroundTasks,
        url: str = Form(...),
        current_user: User = Depends(get_current_user),
        db: Session = Depends(get_db)
):
    filename = None
    tenant_id = current_user.current_tenant_id

    if not tenant_has_user(db, tenant_id, str(current_user.id)):
        raise HTTPException(status_code=404, detail="User doesn't have access to this tenant")

    if not url:
        raise HTTPException(status_code=400, detail="URL is required for this type")
    filename = url
    type = DocumentType.website
    doc = create_document(db,
                          tenant_id=tenant_id,
                          uploaded_by=str(current_user.id),
                          filename=filename,
                          filepath="N/A",
                          doc_type=type,
                          source=url)
    background_tasks.add_task(process_website, db, doc, url)
    return {"message": "Document uploaded", "document_id": str(doc.id)}

@router.get("/chat/session/{session_id}")
def get_chat_session_messages(
    session_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    tenant_id = current_user.current_tenant_id

    if not tenant_has_user(db, tenant_id, str(current_user.id)):
        raise HTTPException(
            status_code=404,
            detail="User doesn't have access to this tenant"
        )

    session = get_session_by_id(db, session_id)
    if not session:
        raise HTTPException(
            status_code=404,
            detail="Chat session not found"
        )

    messages = load_all_messages(db, session.id)

    return [{
        "role": message.role,
        "content": message.content,
        "created_at": message.created_at
    } for message in messages]

@router.post("/query")
def ask_query_stream(
    payload: QueryRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    tenant_id = current_user.current_tenant_id

    if not tenant_has_user(db, tenant_id, str(current_user.id)):
        raise HTTPException(
            status_code=404,
            detail="User doesn't have access to this tenant"
        )
    
    session = get_or_create_session(
        db,
        tenant_id=tenant_id,
        user_id=str(current_user.id),
        session_id=payload.session_id
    )

    stream = query_document_stream(db=db, 
                                   tenant_id=tenant_id, 
                                   session_id=session.id, 
                                   query=payload.query)

    def event_stream():
        for chunk in stream:
            yield chunk

    return StreamingResponse(
        event_stream(),
        media_type="text/plain"
    )

@router.post("/widget/query")
def ask_widget_query_stream(
    request: Request,
    payload: WidgetQueryRequest,
    db: Session = Depends(get_db)
):

    token = payload.token
    query = payload.query
    session_id = payload.session_id
    if not token or not query:
        raise HTTPException(
            status_code=400,
            detail="Token and query are required"
        )
    widget = get_widget_by_token(db, token)
    if not widget:
        raise HTTPException(
            status_code=404,
            detail="Widget not found"
        )
    if not validate_origin(request, widget):
        raise HTTPException(
            status_code=403,
            detail="Origin not allowed"
        )
    client_ip = request.client.host
    key = f"{widget.id}:{client_ip}"

    if not embed_rate_limiter.allow(key):
        raise HTTPException(
            status_code=429,
            detail="Too many requests"
        )
    tenant_id = str(widget.tenant_id)
    
    session = get_or_create_session(
        db,
        tenant_id=tenant_id,
        user_id=None,
        session_id=session_id
    )

    stream = query_document_stream(db=db, 
                                   tenant_id=tenant_id, 
                                   session_id=session.id, 
                                   query=payload.query)

    def event_stream():
        for chunk in stream:
            yield chunk

    response = StreamingResponse(event_stream(), media_type="text/plain")
    response.headers["Access-Control-Allow-Origin"] = request.headers.get("origin", "*")
    response.headers["Vary"] = "Origin"
    return response

@router.put("/{document_id}")
def update_document(
    document_id: str,
    payload: DocumentNewName,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    tenant_id = current_user.current_tenant_id

    if not tenant_has_user(db, tenant_id, str(current_user.id)):
        raise HTTPException(
            status_code=404,
            detail="User doesn't have access to this tenant"
        )

    document = get_document(db, document_id)
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")

    if str(document.tenant_id) != tenant_id:
        raise HTTPException(
            status_code=403,
            detail="User doesn't have access to this document"
        )

    updated_doc = update_document_name(db, document, payload.name)
    return {"message": "Document updated", "document_id": str(updated_doc.id), "filename": updated_doc.filename}

@router.delete("/{document_id}")
def remove_document(
    document_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    tenant_id = current_user.current_tenant_id
    print(tenant_id, current_user.id)

    if not tenant_has_user(db, tenant_id, str(current_user.id)):
        raise HTTPException(
            status_code=404,
            detail="User doesn't have access to this tenant"
        )

    document = get_document(db, document_id)
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")

    if str(document.tenant_id) != tenant_id:
        raise HTTPException(
            status_code=403,
            detail="User doesn't have access to this document"
        )
    
    # Delete document vectors from vector store
    delete_document_vectors(document)

    # Delete document record from database
    delete_document(db, document)
    return {"message": "Document deleted", "document_id": str(document_id)}