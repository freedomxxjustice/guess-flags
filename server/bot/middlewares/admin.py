from aiogram import BaseMiddleware
from aiogram.types import Message
from typing import Callable, Awaitable, Dict, Any

ADMIN_IDS = {938450625}


class AdminOnlyMiddleware(BaseMiddleware):
    async def __call__(
        self,
        handler: Callable[[Message, Dict[str, Any]], Awaitable[Any]],
        event: Message,
        data: Dict[str, Any],
    ) -> Any:
        if event.from_user.id not in ADMIN_IDS:
            await event.answer("🚫 You are not authorized to use this command.")
            return
        return await handler(event, data)
