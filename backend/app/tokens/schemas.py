from pydantic import BaseModel, Field

class SToken(BaseModel):
    """Базовая схема токена с основной информацией"""
    token_id: int
    token_name: str
    token_symbol: str
    token_network_id: int
    staking_available: bool
    
    class Config:
        from_attributes = True

class STokenDetail(SToken):
    """Расширенная схема токена с дополнительной информацией"""
    token_decimals: int
    token_address: str
    
    class Config:
        from_attributes = True 