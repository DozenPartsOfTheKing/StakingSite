from app.database import Base
from sqlalchemy import Column, Integer, String, Boolean, JSON, Date, ForeignKey

class Tokens(Base):
    __tablename__ = "tokens"

    token_id = Column(Integer, primary_key=True)
    token_name = Column(String, nullable=False)
    token_symbol = Column(String, nullable=False)
    token_decimals = Column(Integer, nullable=False)
    token_address = Column(String, nullable=False)
    token_network_id = Column(Integer, ForeignKey("networks.network_id"), nullable=False)
    staking_available = Column(Boolean, nullable=False)
    
