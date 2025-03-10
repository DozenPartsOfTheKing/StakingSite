from sqlalchemy import select
from app.database import async_session_maker
from app.tokens.models import Tokens
from app.base.dao import BaseDAO

class TokenDAO(BaseDAO):
    model = Tokens