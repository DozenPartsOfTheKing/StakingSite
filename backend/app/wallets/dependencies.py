from fastapi import HTTPException, Depends, Request, Header
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from app.wallets.dao import WalletDAO
from app.config import settings
import logging
from app.wallets.models import Wallets
from datetime import datetime, timezone

# Настройка логирования
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Создаем схему OAuth2 для получения токена из заголовка Authorization
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/users/login", auto_error=False)

# Функция для получения всех cookies из запроса
async def get_all_cookies(request: Request):
    return request.cookies

def get_token_from_cookies(request: Request) -> str:
    """Получение токена из cookies"""
    token = request.cookies.get(settings.COOKIE_NAME)
    if not token:
        return None
    return token

def get_token_from_header(authorization: str = None) -> str:
    """Получение токена из заголовка Authorization"""
    if not authorization:
        return None
    
    scheme, param = authorization.strip().split(" ", 1) if " " in authorization else (None, None)
    if scheme and scheme.lower() == "bearer":
        return param
    
    return None

async def get_current_user(
    token: str = Depends(oauth2_scheme),
    request: Request = None,
    cookies: dict = Depends(get_all_cookies),
    authorization: str = Header(None)
) -> Wallets:
    """
    Получение текущего пользователя из токена JWT.
    
    Токен может быть получен из:
    1. Заголовка Authorization
    2. Cookie
    
    Returns:
        Wallets: Объект пользователя (кошелька)
    
    Raises:
        HTTPException: Если токен невалиден или пользователь не найден
    """
    
    # Если токен не получен из OAuth2, ищем в cookie или заголовке Authorization
    final_token = token
    
    if not final_token and cookies and settings.COOKIE_NAME in cookies:
        final_token = cookies[settings.COOKIE_NAME]
        logger.info(f"Using token from cookie: {final_token[:10]}...")
    
    if not final_token and authorization:
        scheme, param = authorization.strip().split(" ", 1) if " " in authorization else (None, None)
        if scheme and scheme.lower() == "bearer":
            final_token = param
            logger.info(f"Using token from Authorization header: {final_token[:10]}...")
    
    if not final_token:
        logger.warning("No token provided")
        raise HTTPException(
            status_code=401,
            detail="Необходима аутентификация",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    try:
        # Декодируем JWT токен
        payload = jwt.decode(
            final_token, 
            settings.SECRET_KEY, 
            algorithms=[settings.ALGORITHM]
        )
        
        user_id = payload.get("sub")
        
        if not user_id:
            logger.warning("Invalid token payload (no sub claim)")
            raise HTTPException(
                status_code=401,
                detail="Недействительный токен",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        # Получаем пользователя из базы данных
        user = await WalletDAO.find_one_or_none(wallet_id=int(user_id))
        
        if not user:
            logger.warning(f"User with ID {user_id} not found")
            raise HTTPException(
                status_code=401,
                detail="Пользователь не найден",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        # Логирование успешной аутентификации с информацией о типе кошелька
        logger.info(f"User authenticated: {user.wallet_id}, wallet type: {user.wallet_type}")
        
        return user
    
    except JWTError as e:
        logger.error(f"JWT decode error: {str(e)}")
        raise HTTPException(
            status_code=401,
            detail="Недействительный токен аутентификации",
            headers={"WWW-Authenticate": "Bearer"},
        )
