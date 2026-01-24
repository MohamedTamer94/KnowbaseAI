
from app.models.document import DocumentType


def get_type(mimetype: str) -> DocumentType:
    if mimetype == "application/pdf":
        return DocumentType.pdf
    elif mimetype == "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        return DocumentType.docx
    elif mimetype == "application/vnd.openxmlformats-officedocument.presentationml.presentation":
        return DocumentType.pptx
    elif mimetype in {"text/plain", "text/markdown"}:
        return DocumentType.text
    elif mimetype in {"text/html"}:
        return DocumentType.website
    else:
        return DocumentType.other