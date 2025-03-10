from pydantic import BaseModel, EmailStr, Field
from datetime import date
from typing import Optional, Literal

class SUserAuth(BaseModel):
    network: int = Field(..., description="ID сети")
    address: str = Field(..., description="Адрес кошелька")
    signature: str = Field(..., description="Подпись сообщения")
    wallet_type: Literal["Trust Wallet", "Tonkeeper"] = Field(
        ..., 
        description="Тип кошелька: Trust Wallet или Tonkeeper"
    )

class SWalletInfo(BaseModel):
    wallet_id: int
    wallet_type: str
    address: str
    network_id: int
    created_at: date
    
    class Config:
        from_attributes = True
    