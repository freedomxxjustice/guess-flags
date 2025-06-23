from fastapi import APIRouter, Depends
from aiogram.utils.web_app import WebAppInitData
from .utils import auth, check_user
from pydantic import BaseModel
from datetime import date


class ScoreUpdate(BaseModel):
    score: int
    numQuestions: int


router = APIRouter(prefix="/api/games/casual", dependencies=[Depends(auth)])


@router.post("/submit-score")
async def submit_answer(
    data: ScoreUpdate,
    auth_data: WebAppInitData = Depends(auth),
):
    user = await check_user(auth_data.user.id)

    user.casual_score += data.score
    if data.score < (int(data.numQuestions) / 1.5):
        user.tries_left -= 1
        if user.tries_left == 0:
            user.last_reset_date = date.today()
    await user.save()

    return {"message": "Score updated", "total_score": user.casual_score}
