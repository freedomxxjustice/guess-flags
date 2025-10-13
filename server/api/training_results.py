from fastapi import APIRouter, Depends
from aiogram.utils.web_app import WebAppInitData
from .utils import auth, check_user
from pydantic import BaseModel


class ScoreUpdate(BaseModel):
    score: int
    numQuestions: int


router = APIRouter(prefix="/api/games/training", dependencies=[Depends(auth)])


@router.post("/submit-score")
async def submit_answer(
    data: ScoreUpdate,
    auth_data: WebAppInitData = Depends(auth),
):
    user = await check_user(auth_data.user.id)

    user.training_score += data.score
    await user.save()

    return {"message": "Score updated", "total_score": user.training_score}
