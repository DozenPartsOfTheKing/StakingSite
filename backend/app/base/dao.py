from sqlalchemy import select, insert, delete, update
from app.database import async_session_maker

class BaseDAO:
    model = None    # instad of .self we use .cls
    
    @classmethod
    async def find_by_id(cls, model_id: int):
        async with async_session_maker() as session:
            query = select(cls.model).filter_by(id=model_id)
            result = await session.execute(query)
            return result.scalar_one_or_none() # return first row or None
        

    @classmethod
    async def find_one_or_none(cls, **filter_by):
        async with async_session_maker() as session:
            query = select(cls.model).filter_by(**filter_by)
            result = await session.execute(query)
            return result.scalars().one_or_none()
    

    @classmethod
    async def find_all(cls, **filter_by):
        async with async_session_maker() as session:
            query = select(cls.model).filter_by(**filter_by)
            result = await session.execute(query)
            return result.scalars().all()

    @classmethod
    async def get_all(cls, wallet_id=None):
        async with async_session_maker() as session:
            if wallet_id:
                query = select(cls.model).filter_by(wallet_id=wallet_id)
            else:
                query = select(cls.model)
            result = await session.execute(query)
            return result.scalars().all()

    @classmethod
    async def add(cls, **data):
        async with async_session_maker() as session:
            # Создаем объект модели
            obj = cls.model(**data)
            session.add(obj)
            await session.commit()
            # Обновляем объект из базы данных, чтобы получить ID
            await session.refresh(obj)
            return obj

    @classmethod
    async def delete(cls, **filter_by):
        async with async_session_maker() as session:
            query = delete(cls.model).filter_by(**filter_by)
            await session.execute(query)
            await session.commit()
            
    @classmethod
    async def update(cls, id_name, id_value, **data):
        async with async_session_maker() as session:
            query = update(cls.model).where(getattr(cls.model, id_name) == id_value).values(**data)
            await session.execute(query)
            await session.commit()
