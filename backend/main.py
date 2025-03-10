import uvicorn
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from app.wallets.router import router as wallets_router
from app.staking.router import router as staking_router
from app.tokens.router import router as tokens_router
from app.database import add_test_data
from fastapi.openapi.docs import get_swagger_ui_html
from fastapi.staticfiles import StaticFiles

app = FastAPI(
    title="Staking API",
    description="""
    API для стейкинга токенов
    
    ## Аутентификация
    
    Для доступа к защищенным эндпоинтам необходимо пройти аутентификацию:
    
    1. Выполните запрос к `/users/login` с адресом кошелька и ID сети
    2. После успешной аутентификации, токен будет автоматически сохранен в cookie браузера
    3. Все последующие запросы будут автоматически аутентифицированы с помощью этого токена
    
    ### Альтернативный способ с заголовком Authorization
    
    Вы также можете использовать полученный токен в заголовке для прямых API-запросов:
    ```
    Authorization: Bearer your_token_here
    ```
    
    ### В Swagger UI
    
    Для тестирования API через Swagger UI:
    
    1. Нажмите на эндпоинт `/users/login` и введите данные для входа
    2. После успешного входа токен будет сохранен в cookie и все запросы будут аутоматически аутентифицированы
    
    При желании можно также использовать кнопку "Authorize":
    1. Нажмите кнопку "Authorize" в верхней части страницы
    2. Введите токен в формате `Bearer your_token_here` (с пробелом после "Bearer")
    3. Нажмите "Authorize"
    
    ### Пример использования API
    
    ```python
    import requests
    
    # Логин и получение токена
    response = requests.post("http://localhost:8000/users/login", json={
        "network": 1,
        "address": "0x1234...",
        "signature": "0xabcd..."
    })
    
    # Токен автоматически сохранится в cookie
    # Используем ту же сессию для следующих запросов
    session = requests.Session()
    session.cookies.update(response.cookies)
    
    # Запрос защищенного ресурса (токен берется из cookie автоматически)
    user_info = session.get("http://localhost:8000/users/me")
    print(user_info.json())
    ```
    
    ### Токен действителен в течение 30 минут
    """,
    version="1.0.0"
)

# Настройка CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # В продакшене замените на конкретные домены
    allow_credentials=True,  # Важно для работы с cookie!
    allow_methods=["*"],
    allow_headers=["*"],
)

# Подключение роутеров
app.include_router(wallets_router)
app.include_router(staking_router)
app.include_router(tokens_router)

@app.on_event("startup")
async def startup_event():
    await add_test_data()

@app.get("/")
async def root():
    return {"message": "Hello World"}

if __name__ == "__main__":
    uvicorn.run("main:app", reload=True)