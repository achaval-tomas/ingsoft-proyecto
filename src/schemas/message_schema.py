from pydantic import BaseModel


class MessageSchema(BaseModel):
    type: str


class ErrorMessageSchema(BaseModel):
    type: str = 'error'
    message: str
