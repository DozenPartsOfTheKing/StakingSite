from pydantic import BaseModel, EmailStr, Field
from datetime import datetime
from typing import Optional

class SStaking(BaseModel):
    wallet_id: int
    token_id: int
    amount: float
    network: str
    staked_at: datetime
    unstake_requested_at: Optional[datetime] = None
    unstaked_at: Optional[datetime] = None
    staking_type: str
    staking_status: str
    destination_address: Optional[str] = None

class StakingCreate(BaseModel):
    token_id: int
    amount: float
    network: str
    destination_address: str
    