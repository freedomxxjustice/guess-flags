from datetime import date
from fastapi import APIRouter, Request, Depends, Query
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
    if user.last_reset_date != today:
        user.tries_left += 3
        user.last_reset_date = today
        await user.save()
    user_obj = (await UserSchema.from_tortoise_orm(user)).model_dump(mode="json")

    return JSONResponse({"user": user_obj})


@router.get("/get-leaders")
async def get_leaders(
    user_id: int = Query(..., description="ID of the current user")
) -> JSONResponse:
    # Fetch top 50 users by casual_score descending
    top_50 = await User.all().order_by("-casual_score").limit(50)

    leaders_dict = {}
    for leader in top_50:
        leader_obj = (await UserSchema.from_tortoise_orm(leader)).model_dump(
            mode="json"
        )
        leaders_dict[int(leader_obj["id"])] = {
            "name": leader_obj["name"],
            "casual_score": leader_obj["casual_score"],
        }

    # Get the current user
    user = await User.get(id=user_id)
    user_obj = (await UserSchema.from_tortoise_orm(user)).model_dump(mode="json")

    # Compute user's global rank (1-based)
    user_rank = await User.filter(casual_score__gt=user.casual_score).count() + 1

    return JSONResponse({"leaders": leaders_dict, "user_rank": user_rank})
