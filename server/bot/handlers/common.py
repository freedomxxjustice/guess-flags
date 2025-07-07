from aiogram import Router
from aiogram.types import Message
from aiogram.filters import CommandStart

from bot.keyboards import main_markup
from db import User

router = Router(name="common")


@router.message(CommandStart())
async def start(message: Message) -> None:
    user = await User.filter(id=message.from_user.id).exists()
    if not user:
        await User.create(id=message.from_user.id, name=message.from_user.first_name)

    await message.answer(
        """🌍 Welcome to GuessFlags! 🏳️  
Test your knowledge of country flags, climb the leaderboard, and take part in daily tournaments to win prizes: Gifts & Stars! 🌟

✅ Community: @GuessFlags  
❓ Support: @chasingamy

Let’s see how many flags you can guess correctly — good luck! 🎯
""",
        reply_markup=main_markup,
    )
