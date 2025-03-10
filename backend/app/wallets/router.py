from fastapi import APIRouter, Response, HTTPException, Depends, Security, Request, Header
from app.wallets.schemas import SUserAuth, SWalletInfo
from app.wallets.dao import WalletDAO
from app.networks.dao import NetworkDAO
from app.exceptions import UserAlreadyExistsException
from datetime import date, timedelta
from app.wallets.auth import create_access_token, verify_trust_wallet_signature, verify_tonkeeper_signature
from app.wallets.models import Wallets
from app.wallets.dependencies import get_current_user
from app.config import settings
import logging

# Настройка логирования
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/users", 
    tags=["Users", "Authentication"]
)

@router.post("/login", summary="Вход пользователя через Trust Wallet или Tonkeeper")
async def login(user_data: SUserAuth, request: Request, response: Response) -> dict:
    """
    Аутентификация пользователя по адресу кошелька и сети.
    
    - Если пользователь существует, возвращает токен доступа
    - Если пользователь не существует, создает нового и возвращает токен
    
    Поддерживаемые кошельки:
    - Trust Wallet
    - Tonkeeper
    
    Токен автоматически устанавливается в cookie и будет использоваться 
    для аутентификации во всех защищенных эндпоинтах.
    Вы также можете использовать токен в заголовке Authorization:
    `Authorization: Bearer your_token_here`
    """
    logger.info(f"Login attempt: address={user_data.address}, network={user_data.network}, wallet_type={user_data.wallet_type}")
    
    # Получаем заголовок User-Agent для определения типа устройства
    user_agent = request.headers.get("User-Agent", "")
    is_mobile = "Mobile" in user_agent or "Android" in user_agent or "iPhone" in user_agent
    logger.info(f"User-Agent: {user_agent[:50]}... (Mobile: {is_mobile})")
    
    # Проверяем существование сети с указанным ID
    network = await NetworkDAO.find_one_or_none(network_id=user_data.network)
    if not network:
        raise HTTPException(
            status_code=404,
            detail=f"Сеть с ID {user_data.network} не найдена"
        )
    
    # Проверяем поддержку типа кошелька для выбранной сети
    if network.network_name == "TON" and user_data.wallet_type not in ["Trust Wallet", "Tonkeeper"]:
        raise HTTPException(
            status_code=400,
            detail=f"Для сети TON доступны только Trust Wallet и Tonkeeper"
        )
    elif network.network_name == "Ethereum" and user_data.wallet_type not in ["Trust Wallet"]:
        raise HTTPException(
            status_code=400,
            detail=f"Для сети Ethereum доступен только Trust Wallet"
        )
    
    # Верифицируем подпись в зависимости от типа кошелька
    is_signature_valid = False
    
    if user_data.wallet_type == "Trust Wallet":
        is_signature_valid = await verify_trust_wallet_signature(
            address=user_data.address,
            signature=user_data.signature,
            network_name=network.network_name,
            user_agent=user_agent
        )
    elif user_data.wallet_type == "Tonkeeper":
        is_signature_valid = await verify_tonkeeper_signature(
            address=user_data.address,
            signature=user_data.signature,
            user_agent=user_agent
        )
    
    # Если подпись недействительна, возвращаем ошибку
    if not is_signature_valid:
        raise HTTPException(
            status_code=401,
            detail="Недействительная подпись"
        )
    
    existing_user = await WalletDAO.find_one_or_none(
        address=user_data.address,
        network_id=user_data.network
    )
    
    if existing_user:
        # Если тип кошелька изменился, обновляем его
        if existing_user.wallet_type != user_data.wallet_type:
            await WalletDAO.update(
                id_name="wallet_id",
                id_value=existing_user.wallet_id,
                wallet_type=user_data.wallet_type
            )
        
        # Создаем токен с идентификатором кошелька
        access_token = create_access_token({"sub": str(existing_user.wallet_id)})
        
        logger.info(f"Successful login for existing user: {existing_user.wallet_id}")
    else:
        # Создаем нового пользователя
        new_user = await WalletDAO.add(
            address=user_data.address,
            network_id=user_data.network,
            wallet_type=user_data.wallet_type,
            created_at=date.today()
        )
        
        # Создаем токен с идентификатором нового кошелька
        access_token = create_access_token({"sub": str(new_user.wallet_id)})
        
        logger.info(f"Created new user with wallet_id: {new_user.wallet_id}")
    
    # Устанавливаем токен в cookie и возвращаем его в ответе
    response.set_cookie(
        key=settings.COOKIE_NAME,  # Использование правильного имени cookie из настроек
        value=access_token,
        httponly=True,
        max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        secure=settings.COOKIE_SECURE,
        samesite="lax"  # Безопасное значение для большинства случаев
    )
    
    # Добавляем информацию о типе устройства в ответ
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "wallet_type": user_data.wallet_type,
        "is_mobile": is_mobile
    }


@router.post("/logout")
async def user_logout(response: Response):
    """
    Выход пользователя из системы.
    Удаляет токен из cookies.
    """
    response.delete_cookie(settings.COOKIE_NAME)
    return {"message": "Успешный выход из системы"}


@router.get("/me", response_model=SWalletInfo, summary="Получение информации о текущем пользователе")
async def get_current_wallet_info(request: Request, current_user: Wallets = Depends(get_current_user)):
    """
    Получение информации о текущем аутентифицированном пользователе.
    
    Токен авторизации автоматически извлекается из cookie или заголовка Authorization.
    """
    logger.info(f"Get current user info: {current_user.wallet_id}")
    return current_user


@router.get("/test-auth", summary="Тестовый эндпоинт для проверки аутентификации")
async def test_auth(request: Request, current_user: Wallets = Depends(get_current_user)):
    """
    Тестовый эндпоинт для проверки аутентификации.
    Токен авторизации автоматически извлекается из cookie или заголовка Authorization.
    """
    logger.info(f"Test auth endpoint called for user: {current_user.wallet_id}")
    
    # Получаем все cookies и заголовки для отладки
    cookies = request.cookies
    headers = dict(request.headers)
    
    return {
        "message": "Тестовый эндпоинт аутентификации",
        "user_id": current_user.wallet_id,
        "address": current_user.address,
        "network_id": current_user.network_id,
        "cookies": cookies,
        "authorization_header": headers.get("authorization", "Not found")
    }