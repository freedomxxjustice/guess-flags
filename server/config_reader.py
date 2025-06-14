from pathlib import Path
from pydantic import SecretStr
from pydantic_settings import BaseSettings, SettingsConfigDict
import logging
from typing import AsyncGenerator

from aiogram import Bot, Dispatcher
from fastapi import FastAPI
from tortoise import Tortoise

ROOT_DIR = Path(__file__).parent.parent

logging.basicConfig(level=logging.INFO)


class Config(BaseSettings):
    BOT_TOKEN: SecretStr
    DB_URL: SecretStr
    # backend
    WEBHOOK_URL: str = "https://a5b7c2f9d0d15ad58a49625303b4361b.serveo.net"
    WEBHOOK_PATH: str = "/webhook"
    # frontend
    WEBAPP_URL: str = "https://4f1eeb5e57736178a12fe636d5bcde5e.serveo.net"

    APP_HOST: str = "localhost"
    APP_PORT: int = 8000

    model_config = SettingsConfigDict(
        env_file=ROOT_DIR / "server" / ".env", env_file_encoding="utf-8"
    )


async def lifespan(app: FastAPI) -> AsyncGenerator:
    await bot.set_webhook(
        url=f"{config.WEBHOOK_URL}/webhook",
        allowed_updates=dp.resolve_used_update_types(),
        drop_pending_updates=True,
    )

    await Tortoise.init(TORTOISE_ORM)

    yield
    await Tortoise.close_connections()
    await bot.session.close()


config = Config()

bot = Bot(config.BOT_TOKEN.get_secret_value())
dp = Dispatcher()
app = FastAPI(lifespan=lifespan)


TORTOISE_ORM = {
    "connections": {"default": config.DB_URL.get_secret_value()},
    "apps": {
        "models": {
            "models": ["db.models.user", "db.models.flag", "db.models.match", "aerich.models"],
            "default_connection": "default",
        },
    },
}
