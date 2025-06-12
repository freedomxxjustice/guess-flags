from aiogram import Router, F
from aiogram.types import Message, PreCheckoutQuery

router = Router(name="payment")


@router.pre_checkout_query()
async def pre_checkout_query(query: PreCheckoutQuery) -> None:
    print("ok")
    await query.answer(ok=True)


@router.message(F.successfull_payment)
async def successful_payment(message: Message) -> None:
    print("Ok")
    message.answer("Paid")
