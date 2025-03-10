# Импортируем необходимые модули из SQLAlchemy для работы с асинхронной БД
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker
from sqlalchemy import text

from app.config import settings 

DB_URL = settings.DATABASE_URL

# Создаем асинхронный движок SQLAlchemy
engine = create_async_engine(DB_URL)

# Создаем фабрику сессий
# expire_on_commit=False отключает обновление объектов после коммита
async_session_maker = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

# Базовый класс для всех моделей
# От него будут наследоваться все классы моделей таблиц
class Base(DeclarativeBase):
    pass

async def add_test_data():
    async with async_session_maker() as session:
        # Проверяем, есть ли уже данные в таблице networks
        result = await session.execute(text("SELECT COUNT(*) FROM networks"))
        count = result.scalar()
        
        if count == 0:
            # Добавляем тестовые сети с помощью чистого SQL-запроса
            insert_query = text("""
                INSERT INTO networks (network_id, network_name, network_type, network_url, network_currency) 
                VALUES 
                (1, 'Ethereum', 'EVM', 'https://ethereum.org', 'ETH'),
                (3, 'TON', 'TON', 'https://ton.org', 'TON')
            """)
            await session.execute(insert_query)
            await session.commit()
            print("Тестовые данные для networks добавлены")
            
            # Проверяем, есть ли уже данные в таблице tokens
            result = await session.execute(text("SELECT COUNT(*) FROM tokens"))
            count = result.scalar()
            
            if count == 0:
                # Добавляем тестовые токены, используя network_id как внешний ключ
                insert_tokens_query = text("""
                    INSERT INTO tokens (token_id, token_name, token_symbol, token_decimals, token_address, token_network_id, staking_available) 
                    VALUES 
                    (1, 'Ethereum', 'ETH', 18, '0x0000000000000000000000000000000000000000', 1, true),
                    (2, 'USD Coin', 'USDC', 6, '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', 1, true),
                    (3, 'TON', 'TON', 9, '0:0000000000000000000000000000000000000000000000000000000000000000', 3, true),
                    (4, 'Tether', 'USDT', 6, '0:A519F99BB5D6D51EF958ED24D337AD75A1C770885DCD42D51D6663F9FCD3373B', 3, false)
                """)
                await session.execute(insert_tokens_query)
                await session.commit()
                print("Тестовые данные для tokens добавлены")



