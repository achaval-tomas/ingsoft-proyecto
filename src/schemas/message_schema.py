from pydantic import BaseModel


class MessageSchema(BaseModel):
    type: str


class ErrorMessageSchema(BaseModel):
    type: str = 'error'
    message: str


def simple_message(msg_type: str):
    return MessageSchema(type=msg_type).model_dump_json()


def error_message(detail: str):
    return ErrorMessageSchema(
        message=detail,
    ).model_dump_json()
