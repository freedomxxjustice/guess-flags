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


def calculate_multiplier(gamemode: str, tags: list[str]) -> float:
    multiplier = 1.0

    if gamemode == "CHOOSE":
        multiplier *= 0.7
    elif gamemode == "ENTER":
        multiplier *= 1.2

    if not tags or "ALL" in tags:
        multiplier *= 1.0
    elif "UN" in tags and len(tags) == 1:
        multiplier *= 0.6
    elif "RARE" in tags:
        multiplier *= 1.3

    return round(multiplier, 2)
