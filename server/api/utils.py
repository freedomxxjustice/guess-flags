from fastapi import Request, HTTPException

from aiogram.utils.web_app import WebAppInitData, safe_parse_webapp_init_data
from config_reader import config

from db import User


def auth(request: Request) -> WebAppInitData:
    try:
        auth_string = request.headers.get("initData", None)
        if auth_string:
            data = safe_parse_webapp_init_data(
                config.BOT_TOKEN.get_secret_value(), auth_string
            )
            return data
        raise HTTPException(401, {"error": "Unauthorized"})
    except Exception:
        raise HTTPException(401, {"error": "Unauthorized"})


async def check_user(user_id: int) -> User:
    user = await User.filter(id=user_id).first()
    if not user:
        raise HTTPException(401, {"error": "Unauthorized"})
    return user
