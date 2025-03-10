from app.database import Base
from sqlalchemy import Column, Integer, String, Boolean, JSON, Date, ForeignKey

class Networks(Base):
    __tablename__ = "networks"

    network_id = Column(Integer, primary_key=True)
    network_name = Column(String, nullable=False)
    network_type = Column(String, nullable=False)
    network_url = Column(String, nullable=False)
    network_currency = Column(String, nullable=False)
    
