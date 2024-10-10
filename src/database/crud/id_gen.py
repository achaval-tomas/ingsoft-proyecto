import base64
from uuid import uuid4


def create_uuid():
    return base64.urlsafe_b64encode(uuid4().bytes).decode('utf-8').strip('=')
