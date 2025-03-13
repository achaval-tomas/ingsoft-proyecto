from base64 import urlsafe_b64encode
from uuid import uuid4


def create_uuid():
    return urlsafe_b64encode(uuid4().bytes).decode('utf-8').strip('=')
