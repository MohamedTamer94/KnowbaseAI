
from fastapi import Request

from app.models.embed_widget import EmbedWidget

def validate_origin(request: Request, widget: EmbedWidget):
    origin = request.headers.get("origin")
    print(f"Validating origin: {origin} against allowed domains: {widget.allowed_domains}")
    if not origin:
        return False

    if not widget.allowed_domains:
        return True

    return any(origin.startswith(d) for d in widget.allowed_domains)
