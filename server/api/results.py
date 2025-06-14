from fastapi import APIRouter, Depends
from aiogram.utils.web_app import WebAppInitData
from .utils import auth, check_user
from pydantic import BaseModel


class ScoreUpdate(BaseModel):
    score: int


router = APIRouter(prefix="/api/games", dependencies=[Depends(auth)])


@router.post("/submit-score")
async def submit_answer(
    data: ScoreUpdate,
    auth_data: WebAppInitData = Depends(auth),
):
    user = await check_user(auth_data.user.id)

    user.casual_score += data.score
    await user.save()

    return {"message": "Score updated", "total_score": user.casual_score}
