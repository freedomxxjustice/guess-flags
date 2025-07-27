import logging
from fastapi import Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn
from aiogram.types import (
    Update,
)
from aiogram.utils.i18n import I18n, FSMI18nMiddleware

from api import setup_routers as setup_api_routers
from bot.handlers import setup_routers as setup_bot_routers

from config_reader import config, dp, bot, app

i18n = I18n(
    path="locales",  # folder where translations live
    default_locale="en",  # fallback if no match
    domain="messages",  # base filename without .po/.mo
)
dp.message.middleware(FSMI18nMiddleware(i18n))

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://app.guessflags.space"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


dp.include_router(setup_bot_routers())
app.include_router(setup_api_routers())


@app.post(config.WEBHOOK_PATH)
async def webhook(request: Request) -> None:
    """Set web"""
    data = await request.json()
    update = Update.model_validate(data, context={"bot": bot})
    await dp.feed_update(bot, update)


@app.exception_handler(Exception)
async def global_exception_handler(_: Request, exc: Exception):
    """Handle exceptions"""
    logging.error("Unhandled error: %s", exc)
    return JSONResponse(status_code=500, content={"detail": "Internal Server Error"})


if __name__ == "__main__":
    uvicorn.run(app, host=config.APP_HOST, port=config.APP_PORT)
