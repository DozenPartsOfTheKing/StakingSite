from fastapi import APIRouter, Request, Depends, HTTPException, Security, Header, BackgroundTasks
from sqlalchemy import select
from app.database import async_session_maker
from app.staking.dao import StakingDAO
from app.staking.schemas import SStaking, StakingCreate
from app.wallets.models import Wallets
from app.wallets.dependencies import get_current_user
from datetime import datetime, timedelta
from app.tokens.dao import TokenDAO
import logging
import asyncio
from app.staking.models import Staking

# Настройка логирования
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/staking",
    tags=['Staking']
)

# Конфигурация аккаунтов для перевода средств
TON_ACCOUNT = "TON12345678901234567890"
ETH_ACCOUNT = "0x1234567890abcdef1234567890abcdef12345678"

# Фоновая задача для unstaking через 30 секунд
async def process_unstake(staking_id: int):
    await asyncio.sleep(30)  # Ожидаем 30 секунд
    
    # Получаем стейкинг
    staking = await StakingDAO.find_one_or_none(staking_id=staking_id)
    if not staking or staking.staking_status != "unstaking":
        logger.error(f"Failed to unstake {staking_id}: Staking not found or not in unstaking status")
        return
    
    # Обновляем статус
    await StakingDAO.update(
        id_name="staking_id", 
        id_value=staking_id, 
        unstaked_at=datetime.utcnow(),
        staking_status="completed"
    )
    logger.info(f"Successfully unstaked staking {staking_id}")

@router.get("")
async def get_staking_list(request: Request, current_user: Wallets = Depends(get_current_user)) -> list[SStaking]:
    """
    Получение списка стейкингов текущего пользователя.
    
    Токен авторизации автоматически извлекается из cookie или заголовка Authorization.
    """
    try:
        logger.info(f"Get staking list for user: {current_user.wallet_id}")
        stakings = await StakingDAO.get_all(current_user.wallet_id)
        logger.info(f"Found {len(stakings)} stakings for user {current_user.wallet_id}")
        return stakings
    except Exception as e:
        logger.error(f"Error getting staking list: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Ошибка при получении списка стейкингов: {str(e)}")

# Эти специфичные маршруты должны быть ПЕРЕД динамическим маршрутом /{staking_id}
@router.get("/networks", summary="Получение списка доступных сетей")
async def get_networks():
    """
    Получение списка доступных сетей для стейкинга.
    """
    try:
        logger.info("Get networks list")
        networks = {
            "networks": [
                {"id": "TON", "name": "TON Network", "wallets": ["Trust Wallet", "Tonkeeper"]},
                {"id": "ETH", "name": "Ethereum", "wallets": ["Trust Wallet"]}
            ]
        }
        return networks
    except Exception as e:
        logger.error(f"Error getting networks list: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Ошибка при получении списка сетей: {str(e)}")

@router.get("/balance", summary="Получение баланса стейкинга")
async def get_staking_balance(request: Request, current_user: Wallets = Depends(get_current_user)):
    """
    Получение баланса стейкинга для текущего пользователя.
    
    Токен авторизации автоматически извлекается из cookie или заголовка Authorization.
    """
    logger.info(f"Get staking balance for user: {current_user.wallet_id}")
    
    # Получаем активные стейкинги пользователя
    async with async_session_maker() as session:
        query = select(Staking).filter_by(wallet_id=current_user.wallet_id, staking_status="active")
        result = await session.execute(query)
        active_stakings = result.scalars().all()
    
    # Формируем данные о балансе
    balance_data = []
    for staking in active_stakings:
        token = await TokenDAO.find_one_or_none(token_id=staking.token_id)
        
        balance_data.append({
            "token_id": staking.token_id,
            "token_symbol": token.token_symbol if token else f"Token #{staking.token_id}",
            "amount": staking.amount,
            "network": staking.network,
            "staked_at": staking.staked_at
        })
    
    return {
        "wallet": current_user.address,
        "staking_balance": balance_data
    }

# Теперь идут маршруты с динамическими параметрами
@router.get("/{staking_id}")
async def get_staking(
    staking_id: int,
    request: Request, 
    current_user: Wallets = Depends(get_current_user)
) -> SStaking:
    """
    Получение информации о конкретном стейкинге.
    
    Токен авторизации автоматически извлекается из cookie или заголовка Authorization.
    
    Parameters:
    - staking_id: ID стейкинга
    """
    logger.info(f"Get staking {staking_id} for user: {current_user.wallet_id}")
    return await StakingDAO.find_one_or_none(staking_id=staking_id)

@router.post("/{staking_id}/unstake", summary="Запрос на анстейкинг")
async def request_unstake(
    staking_id: int,
    background_tasks: BackgroundTasks,
    request: Request,
    current_user: Wallets = Depends(get_current_user)
):
    """
    Запрос на анстейкинг токенов. Анстейкинг происходит через 30 секунд после запроса.
    
    Токен авторизации автоматически извлекается из cookie или заголовка Authorization.
    
    Parameters:
    - staking_id: ID стейкинга для анстейкинга
    """
    logger.info(f"Unstake request for staking {staking_id} by user {current_user.wallet_id}")
    
    # Получаем стейкинг
    staking = await StakingDAO.find_one_or_none(staking_id=staking_id)
    
    if not staking:
        raise HTTPException(
            status_code=404,
            detail=f"Стейкинг с ID {staking_id} не найден"
        )
    
    # Проверяем, принадлежит ли стейкинг текущему пользователю
    if staking.wallet_id != current_user.wallet_id:
        raise HTTPException(
            status_code=403,
            detail="У вас нет прав на этот стейкинг"
        )
    
    # Проверяем статус стейкинга
    if staking.staking_status != "active":
        raise HTTPException(
            status_code=400,
            detail=f"Анстейкинг невозможен для стейкинга со статусом {staking.staking_status}"
        )
    
    # Обновляем статус на "unstaking"
    await StakingDAO.update(
        id_name="staking_id", 
        id_value=staking_id, 
        unstake_requested_at=datetime.utcnow(),
        staking_status="unstaking"
    )
    
    # Запускаем фоновую задачу для завершения анстейкинга через 30 секунд
    background_tasks.add_task(process_unstake, staking_id)
    
    return {
        "status": "success",
        "message": "Запрос на анстейкинг принят. Процесс займет примерно 30 секунд",
        "staking_id": staking_id
    }

# POST - Создание стейкинга должен быть последним, так как он не конфликтует с другими маршрутами
@router.post("", summary="Стейкинг токенов")
async def stake_tokens(
    staking_data: StakingCreate,
    request: Request,
    current_user: Wallets = Depends(get_current_user)
):
    """
    Стейкинг токенов.
    
    Токен авторизации автоматически извлекается из cookie или заголовка Authorization.
    
    Parameters:
    - token_id: ID токена для стейкинга
    - amount: Количество токенов для стейкинга
    - network: Сеть (TON или ETH)
    - destination_address: Адрес кошелька, на который будут отправлены средства
    """
    logger.info(f"Stake tokens for user: {current_user.wallet_id}, token: {staking_data.token_id}, amount: {staking_data.amount}, network: {staking_data.network}")
    
    # Проверяем существование токена
    token = await TokenDAO.find_one_or_none(token_id=staking_data.token_id)
    if not token:
        raise HTTPException(
            status_code=404,
            detail=f"Токен с ID {staking_data.token_id} не найден"
        )
    
    # Проверяем, доступен ли стейкинг для этого токена
    if not token.staking_available:
        raise HTTPException(
            status_code=400,
            detail=f"Стейкинг для токена {token.token_symbol} недоступен"
        )
    
    # Проверка сети
    if staking_data.network not in ["TON", "ETH"]:
        raise HTTPException(
            status_code=400,
            detail="Поддерживаются только сети TON и ETH"
        )
    
    # Здесь может быть проверка поддержки Trust/TonKeeper  
    # Симулируем перевод средств на соответствующий аккаунт
    destination = TON_ACCOUNT if staking_data.network == "TON" else ETH_ACCOUNT
    
    # Создаем запись о стейкинге в базе данных
    staking_record = {
        "wallet_id": current_user.wallet_id,
        "token_id": staking_data.token_id,
        "amount": staking_data.amount,
        "network": staking_data.network,
        "staked_at": datetime.utcnow(),
        "staking_type": "flexible",
        "staking_status": "active",
        "destination_address": staking_data.destination_address
    }
    
    new_staking = await StakingDAO.add(**staking_record)
    
    # Симуляция перевода средств 
    logger.info(f"Transferred {staking_data.amount} {token.token_symbol} from {staking_data.destination_address} to {destination}")
    
    return {
        "status": "success",
        "message": f"Успешно застейкано {staking_data.amount} {token.token_symbol} в сети {staking_data.network}",
        "wallet": current_user.address,
        "token_id": staking_data.token_id,
        "amount": staking_data.amount,
        "destination": destination,
        "staking_id": new_staking.staking_id
    }

# @router.get("/staking")
# async def get_staking_info():
#     return {"message": "Staking information"}
