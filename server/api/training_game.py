from random import shuffle, sample
from typing import List
from db import Flag, FlagSchema
from fastapi import APIRouter, Request, Depends, HTTPException
from fastapi.responses import JSONResponse
from aiogram.utils.web_app import WebAppInitData
from .utils import auth, check_user

router = APIRouter(prefix="/api/games/training", dependencies=[Depends(auth)])


@router.get("/create")
async def send_game(
    request: Request,
    auth_data: WebAppInitData = Depends(auth),
) -> JSONResponse:
    user = await check_user(auth_data.user.id)
    
    query_params = dict(request.query_params)
    num_questions = query_params.get("num_questions")
    category = query_params.get("category")
    gamemode = query_params.get("gamemode")
    question_list = await create_questions(num_questions, category, gamemode)
    user.casual_game = {"game": {"questions": question_list}}
    await user.save()
    return JSONResponse(content={"game": {"questions": question_list}})


async def create_questions(num_questions, category, gamemode) -> List:
    list_length = int(num_questions)
    questions = []
    if category and category != "frenzy":
        all_ids = await Flag.filter(category=category).values_list("id", flat=True)
    else:
        all_ids = await Flag.all().values_list("id", flat=True)

    if len(all_ids) < list_length:
        raise HTTPException(
            status_code=400, detail="Not enough flags to create questions"
        )
    question_ids = sample(all_ids, list_length)
    for qid in question_ids:
        flag = await Flag.get(id=qid)
        flag_data = (await FlagSchema.from_tortoise_orm(flag)).model_dump(mode="json")
        correct_name = flag_data["name"]
        image = flag_data["image"]

        # Sample 6 unique incorrect IDs excluding the current one
        incorrect_pool = [i for i in all_ids if i != qid]
        if len(incorrect_pool) < 6:
            raise HTTPException(status_code=400, detail="Not enough flags for options")

        incorrect_ids = sample(incorrect_pool, 6)

        # Fetch incorrect option names
        incorrect_names = []
        for iid in incorrect_ids:
            opt = await Flag.get(id=iid)
            opt_data = (await FlagSchema.from_tortoise_orm(opt)).model_dump(mode="json")
            incorrect_names.append(opt_data["name"])

        options = incorrect_names + [correct_name]
        shuffle(options)

        questions.append(
            {
                "id": qid,
                "image": image,
                "options": options,
                "answer": correct_name,
                "mode": gamemode,
            }
        )
    return questions
