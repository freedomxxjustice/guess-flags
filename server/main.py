import sys
from fastapi import Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn
from aiogram.types import (
    Update,
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
    update = Update.model_validate(data, context={"bot": bot})
    await dp.feed_update(bot, update)


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logging.error("Unhandled error: %s", exc)
    return JSONResponse(status_code=500, content={"detail": "Internal Server Error"})


if __name__ == "__main__":
    uvicorn.run(app, host=config.APP_HOST, port=config.APP_PORT)
