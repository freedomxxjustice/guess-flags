from datetime import date
from fastapi import APIRouter, Request, Depends
from fastapi.responses import JSONResponse
from aiogram.utils.web_app import WebAppInitData
from db import UserSchema, User
from .utils import auth, check_user

router = APIRouter(prefix="/api/users", dependencies=[Depends(auth)])


@router.get("/get")
async def get_user(
    request: Request, auth_data: WebAppInitData = Depends(auth)
) -> JSONResponse:
    user = await check_user(auth_data.user.id)
    today = date.today()
    if user.last_reset_date != today and user.tries_left <= 0:
        user.tries_left += 3
        user.last_reset_date = today
        await user.save()
    user_obj = (await UserSchema.from_tortoise_orm(user)).model_dump(mode="json")

    return JSONResponse({"user": user_obj})


@router.get("/get-leaders")
async def get_leaders(request: Request) -> JSONResponse:
    leaders = await User.all().order_by("-casual_score")
    leaders_dict = {}
    for leader in leaders:
        leader_obj = (await UserSchema.from_tortoise_orm(leader)).model_dump(
            mode="json"
        )
        leaders_dict[int(leader_obj["id"])] = {
            "name": leader_obj["name"],
            "casual_score": leader_obj["casual_score"],
        }
    return JSONResponse({"leaders": leaders_dict})
