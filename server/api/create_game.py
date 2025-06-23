from random import shuffle
from random import randint
from db import Flag, FlagSchema
from fastapi import APIRouter, Request, Depends, HTTPException
from fastapi.responses import JSONResponse
from aiogram.utils.web_app import WebAppInitData
from .utils import auth, check_user
from tortoise.exceptions import DoesNotExist

router = APIRouter(prefix="/api/games/casual", dependencies=[Depends(auth)])


@router.get("/create")
async def send_game(
    request: Request,
    auth_data: WebAppInitData = Depends(auth),
) -> JSONResponse:
    user = await check_user(auth_data.user.id)
    if user.tries_left <= 0:
        raise HTTPException(status_code=403, detail="No tries left")
    game_filter = dict(request.query_params).get("num_questions")
    question_list = await create_questions(game_filter)
    return JSONResponse(content={"game": {"questions": question_list}})


async def create_questions(game_filter) -> []:
    list_length = int(game_filter)
    questions = []
    used_ids = set()

    for _ in range(list_length):
        # Get unique flag for the question
        while True:
            random_id = randint(1, 200)
            if random_id not in used_ids:
                try:
                    flag = await Flag.get(id=random_id)
                except DoesNotExist:
                    # Flag with this id doesn't exist, try another id
                    continue
                used_ids.add(random_id)
                break

        flag = await Flag.get(id=random_id)
        flag_data = (await FlagSchema.from_tortoise_orm(flag)).model_dump(mode="json")

        id = flag_data["id"]
        correct_name = flag_data["name"]
        image = flag_data["image"]

        # Get 4 unique incorrect options
        incorrect = []
        while len(incorrect) < 6:
            rand_id = randint(1, 200)
            if rand_id in used_ids:
                continue

            option = await Flag.get(id=rand_id)
            option_data = (await FlagSchema.from_tortoise_orm(option)).model_dump(
                mode="json"
            )
            name = option_data["name"]
            if name != correct_name and name not in incorrect:
                incorrect.append(name)

        # Mix correct with incorrect options
        options = incorrect + [correct_name]

        shuffle(options)

        questions.append(
            {"id": id, "image": image, "options": options, "answer": correct_name}
        )
    return questions
