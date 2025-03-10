from fastapi import APIRouter, Depends, HTTPException, Request
from app.tokens.dao import TokenDAO
from app.tokens.schemas import SToken, STokenDetail
from app.wallets.dependencies import get_current_user
from app.wallets.models import Wallets
import logging

# Настройка логирования
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/tokens",
    tags=["Tokens"]
)

@router.get("", summary="Получение списка всех токенов")
async def get_tokens(request: Request, current_user: Wallets = Depends(get_current_user)) -> list[SToken]:
    """
    Получение списка всех доступных токенов.
    
    Токен авторизации автоматически извлекается из cookie или заголовка Authorization.
    """
    logger.info(f"Get token list for user: {current_user.wallet_id}")
    return await TokenDAO.find_all()

@router.get("/{token_id}", summary="Получение информации о токене")
async def get_token(
    token_id: int,
    request: Request,
    current_user: Wallets = Depends(get_current_user)
) -> STokenDetail:
    """
    Получение детальной информации о токене по его ID.
    
    Токен авторизации автоматически извлекается из cookie или заголовка Authorization.
    
    Parameters:
    - token_id: ID токена
    """
    logger.info(f"Get token {token_id} info for user: {current_user.wallet_id}")
    
    token = await TokenDAO.find_one_or_none(token_id=token_id)
    if not token:
        raise HTTPException(
            status_code=404,
            detail=f"Токен с ID {token_id} не найден"
        )
        
    return token

@router.get("/network/{network_id}", summary="Получение токенов по сети")
async def get_tokens_by_network(
    network_id: int,
    request: Request,
    current_user: Wallets = Depends(get_current_user)
) -> list[SToken]:
    """
    Получение списка токенов для конкретной сети.
    
    Токен авторизации автоматически извлекается из cookie или заголовка Authorization.
    
    Parameters:
    - network_id: ID сети
    """
    logger.info(f"Get tokens for network {network_id} for user: {current_user.wallet_id}")
    
    return await TokenDAO.find_all(token_network_id=network_id) 