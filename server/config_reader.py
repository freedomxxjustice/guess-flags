from typing import AsyncGenerator
from contextlib import AsyncExitStack, asynccontextmanager
from pathlib import Path
import logging
import asyncio

from pydantic import SecretStr
from pydantic_settings import BaseSettings, SettingsConfigDict

from aiogram import Bot, Dispatcher
from aiogram.exceptions import TelegramRetryAfter
from fastapi import FastAPI
from tortoise import Tortoise

ROOT_DIR = Path(__file__).parent.parent

# ==================== Logging ====================
logging.root.setLevel(logging.NOTSET)
logging.basicConfig(level=logging.INFO)
logging.getLogger("uvicorn.access").setLevel(logging.INFO)
logging.getLogger("uvicorn.error").setLevel(logging.INFO)
logging.getLogger("fastapi").setLevel(logging.INFO)
logger = logging.getLogger(__name__)

# ==================== Config ====================
class Config(BaseSettings):
    BOT_TOKEN: SecretStr
    DB_URL: SecretStr

    # backend
    WEBHOOK_URL: str
    WEBHOOK_PATH: str

    # frontend
    WEBAPP_URL: str

    APP_HOST: str
    APP_PORT: int
    ADMIN_ID: int
    model_config = SettingsConfigDict(
        env_file=ROOT_DIR / "server" / ".env", env_file_encoding="utf-8"
    )


config = Config()

# ==================== Bot & Dispatcher ====================
bot = Bot(token=config.BOT_TOKEN.get_secret_value())
dp = Dispatcher(bot=bot)

# ==================== Tortoise ORM ====================
TORTOISE_ORM = {
    "connections": {"default": config.DB_URL.get_secret_value()},
    "apps": {
        "models": {
            "models": [
                "db.models.user",
                "db.models.flag",
                "db.models.match",
                "db.models.tournament",
                "db.models.season",
                "db.models.achievement",
                "aerich.models",
            ],
            "default_connection": "default",
        },
    },
}


# ==================== Helper ====================
async def set_webhook_safe(bot: Bot, url: str):
    """Устанавливаем webhook с автоматическим повтором при TelegramRetryAfter"""
    while True:
        try:
            await bot.set_webhook(
                url=url,
                allowed_updates=dp.resolve_used_update_types(),
                drop_pending_updates=True,
            )
            logger.info("Webhook set successfully at %s", url)
            break
        except TelegramRetryAfter as e:
            logger.warning("Retry after %s seconds due to Telegram rate limit", 1)
            await asyncio.sleep(2000)
        except Exception as e:
            logger.exception("Failed to set webhook!")
            raise


# ==================== FastAPI Lifespan ====================
@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    logger.info("Starting application lifespan...")
    async with AsyncExitStack() as stack:
        # 1️⃣ Устанавливаем webhook
        await set_webhook_safe(bot, f"{config.WEBHOOK_URL.rstrip('/')}/webhook")

        # 2️⃣ Инициализация Tortoise ORM
        await Tortoise.init(TORTOISE_ORM)
        stack.push_async_callback(Tortoise.close_connections)
        logger.info("Tortoise ORM initialized.")

        # 3️⃣ Регистрация закрытия сессии бота
        stack.push_async_callback(bot.session.close)
        logger.info("Bot session cleanup registered.")

        yield

    logger.info("Application lifespan finished.")


# ==================== FastAPI App ====================
app = FastAPI(lifespan=lifespan)
