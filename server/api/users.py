from datetime import date
from fastapi import APIRouter, Request, Depends
from fastapi.responses import JSONResponse
from aiogram.utils.web_app import WebAppInitData
from db import UserSchema
from .utils import auth, check_user

router = APIRouter(prefix="/api/users", dependencies=[Depends(auth)])


@router.get("/get")
async def get_user(
    request: Request, auth_data: WebAppInitData = Depends(auth)
) -> JSONResponse:
    user = await check_user(auth_data.user.id)
    today = date.today()
    if user.last_reset_date != today:
        user.tries_left = 3
        user.last_reset_date = today
        await user.save()
    user_obj = (await UserSchema.from_tortoise_orm(user)).model_dump(mode="json")

    return JSONResponse({"user": user_obj})
