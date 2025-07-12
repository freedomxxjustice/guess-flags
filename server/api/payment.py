from fastapi import Request, APIRouter, Depends
from fastapi.responses import JSONResponse
from aiogram.methods import CreateInvoiceLink
from aiogram.types import (
    LabeledPrice,
)
from .utils import auth
from config_reader import bot


router = APIRouter(prefix="/api", dependencies=[Depends(auth)])


@router.post("/payment", response_class=JSONResponse)
async def donate(request: Request) -> JSONResponse:
    data = await request.json()
    invoice_link = await bot(
        CreateInvoiceLink(
            title="Donate",
            description="None",
            payload="tries",
            currency="XTR",
            prices=[LabeledPrice(label="XTR", amount=data["amount"])],
        )
    )

    return JSONResponse({"invoice_link": invoice_link})
