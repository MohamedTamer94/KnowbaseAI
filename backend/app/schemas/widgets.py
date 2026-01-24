
from pydantic import BaseModel


class CreateWidgetRequest(BaseModel):
    name: str
    allowed_domains: list[str]