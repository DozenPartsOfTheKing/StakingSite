from sqlalchemy import select
from app.database import async_session_maker
from app.networks.models import Networks
from app.base.dao import BaseDAO

class NetworkDAO(BaseDAO):
    model = Networks