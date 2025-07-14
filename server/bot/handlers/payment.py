from aiogram import Router, F
from aiogram.types import Message, PreCheckoutQuery
from db import User
from tortoise.exceptions import DoesNotExist
from config_reader import bot

from db import (
    Tournament,
    TournamentSchema,
    TournamentParticipant,
    TournamentParticipantSchema,
)

router = Router(name="payment")

PRICE_TO_TRIES = {
    10: 1,  # 10 * 100
    25: 3,  # 25 * 100
    70: 9,  # 70 * 100
}


@router.pre_checkout_query()
async def pre_checkout_query(query: PreCheckoutQuery) -> None:
    print("ok")
    await query.answer(ok=True)


@router.message(F.successful_payment)
async def successful_payment(message: Message) -> None:
    total_amount = message.successful_payment.total_amount  # in smallest currency units
    user_id = message.from_user.id
    payload = message.successful_payment.invoice_payload

    if payload == "tries":
        tries = PRICE_TO_TRIES.get(total_amount)
        await bot.refund_star_payment(
            message.from_user.id, message.successful_payment.telegram_payment_charge_id
        )
        if not tries:
            await message.answer(
                "Thank you for your donation! Your support motivates us to continue developing..."
            )
            return

        try:
            user = await User.get(id=user_id)
            user.tries_left += tries
            await user.save()
            await message.answer(
                f"✅ Payment successful! You've received {tries} more {'try' if tries == 1 else 'tries'} 🎉"
            )
        except DoesNotExist:
            await message.answer(
                "⚠️ Could not find your user profile. Please contact support."
            )
    if payload.startswith("tournament_"):
        tournament_id = int(payload.split("_")[1])
        user_id = message.from_user.id
        await bot.refund_star_payment(
            message.from_user.id, message.successful_payment.telegram_payment_charge_id
        )
        try:
            user = await User.get(id=user_id)
            existing_participant = await TournamentParticipant.filter(
                tournament_id=tournament_id, user_id=user_id
            ).first()

            if existing_participant:
                return message.answer("You are already participating.")

            # Create participant record
            await TournamentParticipant.create(
                tournament_id=tournament_id,
                user_id=user_id,
                score=0,  # initial score
                place=None,
                prize=None,
            )
        except DoesNotExist:
            await message.answer(
                "⚠️ Could not find your user profile. Please contact support."
            )
        await message.answer(
            f"Payment received for tournament {tournament_id}, thank you! You're now participating."
        )
