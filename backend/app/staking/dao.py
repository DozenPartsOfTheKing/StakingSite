from sqlalchemy import select
from app.database import async_session_maker
from app.staking.models import Staking
from app.base.dao import BaseDAO

class StakingDAO(BaseDAO):
    model = Staking