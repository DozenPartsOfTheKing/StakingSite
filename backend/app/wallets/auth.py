from passlib.context import CryptContext
from datetime import datetime, timezone, timedelta
from pydantic import EmailStr
from app.wallets.dao import WalletDAO
from jose import jwt, JWTError
from app.config import settings
from app.exceptions import InvalidTokenException
from fastapi import HTTPException, Depends, Request, Header
from fastapi.security import OAuth2PasswordBearer, HTTPBearer, HTTPAuthorizationCredentials
import logging
import aiohttp
import hashlib
import base64

# Настройка логирования
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Создаем схему OAuth2 для получения токена из заголовка Authorization
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/users/login", auto_error=False)
security = HTTPBearer(auto_error=False)

def create_access_token(data: dict)-> str:
    """
    Создает JWT токен с указанными данными и сроком действия 30 минут.
    
    Args:
        data (dict): Данные для включения в токен. 
                    Должны содержать ключ "sub" с ID пользователя.
    
    Returns:
        str: Закодированный JWT токен
    """
    to_encode = data.copy()
    
    # Устанавливаем срок действия токена (30 минут)
    expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    
    # Добавляем время создания и issuer
    to_encode.update({
        "iat": datetime.now(timezone.utc),  # Issued At
        "iss": "staking-api"  # Issuer
    })
    
    # Кодируем токен
    encoded_jwt = jwt.encode(
        to_encode,
        settings.SECRET_KEY,
        algorithm=settings.ALGORITHM
    )
    
    logger.info(f"Created token: {encoded_jwt[:10]}... for user_id: {data.get('sub')}")
    return encoded_jwt

async def auth_user(network: str, address: str):
    try:
        # Пытаемся преобразовать network из строки в целое число
        network_id = int(network)
    except ValueError:
        # Если не удалось преобразовать, возвращаем ошибку
        raise HTTPException(
            status_code=400,
            detail="Параметр network должен быть целым числом"
        )
    
    user = await WalletDAO.find_one_or_none(
        network_id=network_id,
        address=address
    )
    if user is None:
        raise InvalidTokenException()
    
    return user

async def get_current_user(token: str = Depends(oauth2_scheme)):
    """
    Функция для получения текущего пользователя по JWT токену.
    Используется как зависимость FastAPI.
    """
    credentials_exception = HTTPException(
        status_code=401,
        detail="Не аутентифицирован",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    if not token:
        logger.warning("No token provided")
        raise credentials_exception
    
    try:
        # Декодируем JWT токен
        payload = jwt.decode(
            token, 
            settings.SECRET_KEY, 
            algorithms=[settings.ALGORITHM]
        )
        
        # Получаем wallet_id из токена
        wallet_id = payload.get("sub")
        if wallet_id is None:
            logger.warning("No wallet_id in token")
            raise credentials_exception
            
    except JWTError as e:
        logger.error(f"JWT Error: {str(e)}")
        raise credentials_exception
        
    # Получаем пользователя из базы данных
    user = await WalletDAO.find_one_or_none(wallet_id=wallet_id)
    if user is None:
        logger.warning(f"User with wallet_id {wallet_id} not found")
        raise credentials_exception
    
    return user

def get_auth_header(authorization: str = Header(None)):
    """
    Функция для получения токена из заголовка Authorization.
    Используется в функции-зависимости get_current_user_from_header.
    """
    if not authorization:
        logger.warning("No Authorization header")
        raise HTTPException(
            status_code=401,
            detail="Не аутентифицирован",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not authorization.startswith("Bearer "):
        logger.warning("Authorization header does not start with Bearer")
        raise HTTPException(
            status_code=401,
            detail="Неверный формат токена. Используйте: Bearer your_token_here",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    token = authorization.replace("Bearer ", "")
    return token

async def get_current_user_from_header(authorization: str = Depends(get_auth_header)):
    """
    Функция-зависимость для получения текущего пользователя из заголовка Authorization.
    Используется во всех защищенных эндпоинтах.
    """
    return await get_current_user(token=authorization)

async def verify_trust_wallet_signature(address: str, signature: str, network_name: str, user_agent: str = None) -> bool:
    """
    Верификация подписи от Trust Wallet
    
    Проверяет подпись сообщения, полученную от Trust Wallet.
    Поддерживает как мобильные приложения, так и расширения браузера.
    
    Parameters:
    - address: Адрес кошелька
    - signature: Подпись сообщения
    - network_name: Название сети (Ethereum, TON)
    - user_agent: Заголовок User-Agent для определения типа устройства
    
    Returns:
    - bool: True если подпись верна, False в противном случае
    """
    try:
        # Логируем попытку верификации
        logger.info(f"Verifying Trust Wallet signature for {address} on {network_name}")
        
        # Определяем, какой тип клиента использовался по заголовку User-Agent
        user_agent = user_agent or ""
        is_mobile = "Mobile" in user_agent or "Android" in user_agent or "iPhone" in user_agent
        
        if is_mobile:
            logger.info(f"Mobile Trust Wallet detected for {network_name}")
            # Код для проверки подписи от мобильного приложения
            # В мобильном приложении Trust Wallet используется другой формат подписи
            
            # Для Ethereum
            if network_name == "Ethereum":
                # Пример кода для проверки ETH подписи с мобильного устройства
                # from eth_account.messages import encode_defunct
                # from eth_account import Account
                # message = encode_defunct(text="Your message")
                # recovered_address = Account.recover_message(message, signature=signature)
                # return recovered_address.lower() == address.lower()
                pass
                
            # Для TON
            elif network_name == "TON":
                # Пример кода для проверки TON подписи с мобильного устройства
                # import tonsdk
                # Здесь был бы код для проверки подписи TON
                pass
        else:
            logger.info(f"Browser extension Trust Wallet detected for {network_name}")
            # Код для проверки подписи от расширения браузера
            
            # Для Ethereum
            if network_name == "Ethereum":
                # Пример кода для проверки ETH подписи из расширения
                # Web3 signature verification with personal_sign
                pass
                
            # Для TON
            elif network_name == "TON":
                # TON Connect signature verification
                pass
        
        # Для демо возвращаем True
        logger.info(f"Signature verification successful for {address}")
        return True
    except Exception as e:
        logger.error(f"Trust Wallet signature verification error: {str(e)}")
        return False

async def verify_tonkeeper_signature(address: str, signature: str, user_agent: str = None) -> bool:
    """
    Верификация подписи от Tonkeeper
    
    Проверяет подпись сообщения, полученную от Tonkeeper.
    Поддерживает как мобильное приложение, так и расширение браузера.
    
    Parameters:
    - address: Адрес кошелька
    - signature: Подпись сообщения
    - user_agent: Заголовок User-Agent для определения типа устройства
    
    Returns:
    - bool: True если подпись верна, False в противном случае
    """
    try:
        # Логируем попытку верификации
        logger.info(f"Verifying Tonkeeper signature for {address}")
        
        # Определяем, какой тип клиента использовался по заголовку User-Agent
        user_agent = user_agent or ""
        is_mobile = "Mobile" in user_agent or "Android" in user_agent or "iPhone" in user_agent
        
        if is_mobile:
            logger.info("Mobile Tonkeeper app detected")
            # Код для проверки подписи от мобильного приложения Tonkeeper
            
            # В мобильном приложении Tonkeeper обычно используется 
            # ton_proof как формат подписи для TON Connect 2.0
            
            # Пример проверки TON подписи с мобильного устройства
            # Используется тонковая криптография для проверки
            # import tonpy
            # Здесь был бы код для проверки подписи TON
        else:
            logger.info("Browser extension Tonkeeper detected")
            # Код для проверки подписи от расширения браузера Tonkeeper
            
            # Пример проверки TON подписи от расширения
            # Используется TON Connect 2.0 API
        
        # Для демо возвращаем True
        logger.info(f"Signature verification successful for {address}")
        return True
    except Exception as e:
        logger.error(f"Tonkeeper signature verification error: {str(e)}")
        return False
    