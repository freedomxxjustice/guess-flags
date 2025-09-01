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
    if user.last_reset_date != today and user.tries_left <= 9:
        user.tries_left += 3
        user.last_reset_date = today
        await user.save()
    user_obj = (await UserSchema.from_tortoise_orm(user)).model_dump(mode="json")

    return JSONResponse({"user": user_obj})


@router.get("/get-casual-leaders")
async def get_casual_leaders(
    user_id: int = Query(..., description="ID of the current user")
) -> JSONResponse:
    # Fetch top 50 users by casual_score descending
    top_50 = await User.all().order_by("-casual_score").limit(50)
    top_today_50 = await User.all().order_by("-today_casual_score").limit(50)

    leaders_dict = {}
    for leader in top_50:
        leader_obj = (await UserSchema.from_tortoise_orm(leader)).model_dump(
            mode="json"
        )
        leaders_dict[int(leader_obj["id"])] = {
            "name": leader_obj["name"],
            "casual_score": leader_obj["casual_score"],
        }
    today_leaders_dict = {}
    for today_leader in top_today_50:
        leader_obj = (await UserSchema.from_tortoise_orm(today_leader)).model_dump(
            mode="json"
        )
        today_leaders_dict[int(leader_obj["id"])] = {
            "name": leader_obj["name"],
            "today_casual_score": leader_obj["today_casual_score"],
        }

    # Get the current user
    user = await User.get(id=user_id)
    user_obj = (await UserSchema.from_tortoise_orm(user)).model_dump(mode="json")

    # Compute user's global rank (1-based)
    user_rank = await User.filter(casual_score__gt=user.casual_score).count() + 1
    user_today_rank = (
        await User.filter(today_casual_score__gt=user.today_casual_score).count() + 1
    )
    return JSONResponse(
        {
            "leaders": leaders_dict,
            "today_leaders": today_leaders_dict,
            "user_rank": user_rank,
            "user_today_rank": user_today_rank,
        }
    )


@router.get("/get-training-leaders")
async def get_training_leaders(
    user_id: int = Query(..., description="ID of the current user")
) -> JSONResponse:
    # Fetch top 50 users by casual_score descending
    top_50 = await User.all().order_by("-training_score").limit(50)

    leaders_dict = {}
    for leader in top_50:
        leader_obj = (await UserSchema.from_tortoise_orm(leader)).model_dump(
            mode="json"
        )
        leaders_dict[int(leader_obj["id"])] = {
            "name": leader_obj["name"],
            "training_score": leader_obj["training_score"],
        }

    # Get the current user
    user = await User.get(id=user_id)
    user_obj = (await UserSchema.from_tortoise_orm(user)).model_dump(mode="json")

    # Compute user's global rank (1-based)
    user_rank = await User.filter(casual_score__gt=user.casual_score).count() + 1

    return JSONResponse({"leaders": leaders_dict, "user_rank": user_rank})


@router.get("/active")
async def has_active(
    auth_data: WebAppInitData = Depends(auth),
) -> JSONResponse:
    user = await check_user(auth_data.user.id)
    user_obj = (await UserSchema.from_tortoise_orm(user)).model_dump(mode="json")
    return JSONResponse({"casual_game": user_obj["casual_game"]})
