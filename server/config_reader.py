from typing import AsyncGenerator
from contextlib import AsyncExitStack, asynccontextmanager
from pathlib import Path
import logging
from pydantic import SecretStr
from pydantic_settings import BaseSettings, SettingsConfigDict

from aiogram import Bot, Dispatcher
from fastapi import FastAPI
from tortoise import Tortoise

ROOT_DIR = Path(__file__).parent.parent

logging.root.setLevel(logging.NOTSET)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


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

    model_config = SettingsConfigDict(
        env_file=ROOT_DIR / "server" / ".env", env_file_encoding="utf-8"
    )


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    logger.info("Starting application lifespan...")
    async with AsyncExitStack() as stack:
        try:
            await bot.set_webhook(
                url=f"{config.WEBHOOK_URL.rstrip('/')}/webhook",
                allowed_updates=dp.resolve_used_update_types(),
                drop_pending_updates=True,
            )
            logger.info("Webhook set successfully.")
        except Exception as e:
            logger.exception(e, "Failed to set webhook!")
            raise
        await Tortoise.init(TORTOISE_ORM)
        stack.push_async_callback(Tortoise.close_connections)
        logger.info("Tortoise ORM initialized.")

        stack.push_async_callback(bot.session.close)
        logger.info("Bot session cleanup registered.")

        yield
    logger.info("Application lifespan finished.")


config = Config()

bot = Bot(config.BOT_TOKEN.get_secret_value())
dp = Dispatcher()
app = FastAPI(lifespan=lifespan)


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
