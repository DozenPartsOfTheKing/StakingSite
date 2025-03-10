from app.database import Base
from sqlalchemy import Column, Integer, String, Boolean, JSON, Date, ForeignKey

class Wallets(Base):
    __tablename__ = "wallets"

    wallet_id = Column(Integer, primary_key=True)
    wallet_type = Column(String, nullable=False)
    address = Column(String, nullable=False)
    network_id = Column(Integer, ForeignKey("networks.network_id"), nullable=False)
    # signature = Column(String, nullable=False)
    created_at = Column(Date, nullable=False)
