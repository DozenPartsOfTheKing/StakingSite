from fastapi import HTTPException, status


class UserAlreadyExistsException(HTTPException):
    status_code = status.HTTP_409_CONFLICT
    detail = "User already exists"

    def __init__(self):
        super().__init__(status_code=self.status_code, detail=self.detail)

class UserNotFoundException(HTTPException):
    status_code = status.HTTP_404_NOT_FOUND
    detail = "User not found"

    def __init__(self):
        super().__init__(status_code=self.status_code, detail=self.detail)

class UserNotAuthenticatedException(HTTPException):
    status_code = status.HTTP_401_UNAUTHORIZED
    detail = "Не аутентифицирован"

    def __init__(self):
        super().__init__(status_code=self.status_code, detail=self.detail)  

class TokenExpiredException(HTTPException):
    status_code = status.HTTP_401_UNAUTHORIZED
    detail = "Срок действия токена истек"

    def __init__(self):
        super().__init__(status_code=self.status_code, detail=self.detail,
                        headers={"WWW-Authenticate": "Bearer"})  

class InvalidTokenException(HTTPException):
    status_code = status.HTTP_401_UNAUTHORIZED
    detail = "Недействительный токен"

    def __init__(self):
        super().__init__(status_code=self.status_code, detail=self.detail,
                        headers={"WWW-Authenticate": "Bearer"})

class InsufficientPermissionsException(HTTPException):
    status_code = status.HTTP_403_FORBIDDEN
    detail = "Недостаточно прав"

    def __init__(self):
        super().__init__(status_code=self.status_code, detail=self.detail)

class NoTokenException(HTTPException):
    status_code = status.HTTP_401_UNAUTHORIZED
    detail = "Токен не предоставлен"

    def __init__(self):
        super().__init__(status_code=self.status_code, detail=self.detail,
                        headers={"WWW-Authenticate": "Bearer"})

class TokenValidationException(HTTPException):
    status_code = status.HTTP_401_UNAUTHORIZED
    detail = "Ошибка валидации токена"

    def __init__(self, detail: str = None):
        if detail:
            self.detail = detail
        super().__init__(status_code=self.status_code, detail=self.detail,
                        headers={"WWW-Authenticate": "Bearer"})


