from random import shuffle, sample
from typing import List
from db import (
    Flag,
    FlagSchema,
    CasualMatch,
    CasualAnswer,
    CasualAnswerSchema,
    CasualMatchSchema,
)
from fastapi import APIRouter, Request, Depends, HTTPException, Query
from fastapi.responses import JSONResponse
from aiogram.utils.web_app import WebAppInitData
from .utils import auth, check_user

router = APIRouter(prefix="/api/games/casual", dependencies=[Depends(auth)])


@router.post("/start")
async def casual_start(
    num_questions: int = Query(..., gt=0),
    category: str = Query(None),
    gamemode: str = Query(None),
    auth_data: WebAppInitData = Depends(auth),
) -> JSONResponse:
    user = await check_user(auth_data.user.id)

    if user.tries_left <= 0:
        raise HTTPException(status_code=403, detail="No tries left")

    question_list = await create_questions(num_questions, category, gamemode)

    match = await CasualMatch.create(
        user=user, num_questions=num_questions, questions=question_list
    )

    return JSONResponse(
        {
            "match_id": str(match.id),
            "current_question": {
                "index": 0,
                "id": question_list[0]["id"],
                "image": question_list[0]["image"],
                "options": question_list[0]["options"],
            },
        }
    )


async def create_questions(num_questions, category, gamemode) -> List:
    list_length = int(num_questions)

    if category and category != "frenzy":
        all_flags = await Flag.filter(category=category)
    else:
        all_flags = await Flag.all()

    all_ids = [f.id for f in all_flags]

    if len(all_ids) < list_length:
        raise HTTPException(400, "Not enough flags to create questions")

    question_ids = sample(all_ids, list_length)

    questions = []
    for qid in question_ids:
        flag = next(f for f in all_flags if f.id == qid)
        correct_name = flag.name
        image = flag.image

        incorrect_pool = [f for f in all_flags if f.id != qid]
        if len(incorrect_pool) < 6:
            raise HTTPException(400, "Not enough flags for options")

        incorrect_options = sample(incorrect_pool, 6)
        incorrect_names = [f.name for f in incorrect_options]

        options = incorrect_names + [correct_name]
        shuffle(options)

        questions.append(
            {
                "id": qid,
                "image": image,
                "options": options,
                "mode": gamemode,
                "answer": correct_name,
            }
        )

    return questions


@router.get("/match/{id}")
async def get_match(
    auth_data: WebAppInitData = Depends(auth),
) -> JSONResponse: ...


@router.post("match/{id}/answer")
async def answer(auth_data: WebAppInitData = Depends(auth)) -> JSONResponse: ...


@router.get("/match/{id}/summary")
async def get_summary(auth_data: WebAppInitData = Depends(auth)) -> JSONResponse: ...
