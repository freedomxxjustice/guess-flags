from aiogram import Router
from aiogram.types import Message
from aiogram.filters import CommandStart
from aiogram.utils.i18n import gettext as _ 
from bot.keyboards import main_markup
from db import User

router = Router(name="common")


@router.message(CommandStart())
async def start(message: Message) -> None:
    user = await User.filter(id=message.from_user.id).exists()
    if not user:
        await User.create(id=message.from_user.id, name=message.from_user.first_name)

    await message.answer(
        _("welcome"),
        reply_markup=main_markup,
    )
