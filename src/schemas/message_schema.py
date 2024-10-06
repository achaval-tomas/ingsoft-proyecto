from pydantic import BaseModel


class MessageSchema(BaseModel):
    type: str


class ErrorMessageSchema(MessageSchema):
    message: str
