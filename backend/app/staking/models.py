from app.database import Base
from sqlalchemy import Column, Integer, String, Boolean, JSON, Date, ForeignKey, Float, DateTime
from datetime import datetime

class Staking(Base):
    __tablename__ = "staking"

    staking_id = Column(Integer, primary_key=True)
    wallet_id = Column(Integer, ForeignKey("wallets.wallet_id"), nullable=False)
    token_id = Column(Integer, ForeignKey("tokens.token_id"), nullable=False)
    amount = Column(Float, nullable=False)
    network = Column(String, nullable=False) # TON or ETH
    staked_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    unstake_requested_at = Column(DateTime, nullable=True)
    unstaked_at = Column(DateTime, nullable=True)
    staking_type = Column(String, nullable=False)
    staking_status = Column(String, nullable=False) # active, unstaking, completed
    destination_address = Column(String, nullable=True) # External wallet address where funds were sent
    

