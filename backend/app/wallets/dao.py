from sqlalchemy import select
from app.database import async_session_maker
from app.wallets.models import Wallets
from app.base.dao import BaseDAO

class WalletDAO(BaseDAO):
    model = Wallets