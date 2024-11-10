from datetime import datetime, timedelta, timezone
from typing import Annotated
from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
import jwt

from src.database.crud.crud_player import get_player

SECRET_KEY = "0f1e038500d9926dc570a385b1bec35af3fdbf11d72056d74028dfaa38f4d120"
ALGORITHM = "HS256" 

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="lobby/join")

def create_token(data: dict):
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(hours=5)
    to_encode.update({ "exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, ALGORITHM)
    return encoded_jwt

def validate_token(token: Annotated[str, Depends(oauth2_scheme)]): # when game starts, when entering an active game?
    try:
        payload = jwt.decode(token, SECRET_KEY, ALGORITHM)
        player_id = payload.get("sub")
        if not player_id:
            raise HTTPException(status_code=401, detail="Couldn't validate token")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Couldn't validate token")
    # all tokens (for now) will be created w/ player id as the payload.
    player = get_player(player_id)
    if player is None:
        raise HTTPException(status_code=401, detail="Couldn't validate token")
    return player