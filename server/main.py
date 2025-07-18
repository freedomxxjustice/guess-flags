from fastapi import Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn
from aiogram.methods import CreateInvoiceLink
from aiogram.types import (
    Update,
    LabeledPrice,
)

import logging

from api import setup_routers as setup_api_routers
from bot.handlers import setup_routers as setup_bot_routers

from config_reader import config, dp, bot, app

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
    data = await request.json()
    print("RAW UPDATE:", data)  # <-- log this
    update = Update.model_validate(await request.json(), context={"bot": bot})
    await dp.feed_update(bot, update)


if __name__ == "__main__":
    # session_close()
    logging.basicConfig(level=logging.INFO)
    uvicorn.run(app, host=config.APP_HOST, port=config.APP_PORT)
