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
from fastapi import APIRouter, Request, Depends, HTTPException, Query, Body
from fastapi.responses import JSONResponse
from aiogram.utils.web_app import WebAppInitData
from .utils import auth, check_user
from datetime import datetime, timedelta, timezone

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

    question_list = await create_casual_questions(num_questions, category, gamemode)

    match = await CasualMatch.create(
        user=user,
        num_questions=num_questions,
        questions=question_list,
        started_at=datetime.now(timezone.utc),
        current_question_started_at=datetime.now(
            timezone.utc
        ),  # <-- start first question timer
    )

    user.casual_games_played += 1
    await user.save()

    return JSONResponse(
        {
            "match_id": str(match.id),
            "current_question": {
                "index": 0,
                "flag_id": question_list[0]["flag_id"],
                "image": question_list[0]["image"],
                "options": question_list[0]["options"],
                "mode": question_list[0]["mode"],
            },
        }
    )


async def create_casual_questions(num_questions, category, gamemode) -> List:
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
        # correct_name = flag.name
        image = flag.image

        incorrect_pool = [f for f in all_flags if f.id != qid]
        if len(incorrect_pool) < 6:
            raise HTTPException(400, "Not enough flags for options")

        incorrect_options = sample(incorrect_pool, 6)
        incorrect_names = [f.name for f in incorrect_options]
        incorrect_names.append(flag.name)
        options = incorrect_names
        shuffle(options)

        questions.append(
            {
                "flag_id": qid,
                "image": image,
                "options": options,
                "mode": gamemode,
                "answer": flag.name,
            }
        )

    return questions


@router.get("/match/active")
async def get_match(
    auth_data: WebAppInitData = Depends(auth),
) -> JSONResponse:
    user = await check_user(auth_data.user.id)
    match = await CasualMatch.get_or_none(user_id=user.id, completed_at=None)

    if not match:
        return JSONResponse({"status": "Match not found!"})

    # Validate timer
    if match.current_question_started_at:
        elapsed = datetime.now(timezone.utc) - match.current_question_started_at
        if elapsed.total_seconds() > 6:
            await CasualAnswer.create(
                match=match,
                question_idx=match.current_question_idx,
                flag_id=match.questions[match.current_question_idx]["flag_id"],
                user_answer="Time expired",
                is_correct=False,
            )
            match.current_question_idx += 1
            if match.current_question_idx >= match.num_questions:
                match.completed_at = datetime.now(timezone.utc)
                await complete_casual_match(match, user)
                await match.save()
                return JSONResponse({"status": "Time expired. Match completed."})
            else:
                match.current_question_started_at = datetime.now(timezone.utc)
                await match.save()

    # Return current question (could be a new one if time expired)
    idx = match.current_question_idx
    question = match.questions[idx]

    return JSONResponse(
        {
            "match_id": str(match.id),
            "current_question": {
                "index": idx,
                "flag_id": question["flag_id"],
                "image": question["image"],
                "options": question["options"],
                "mode": question["mode"],
            },
        }
    )


@router.post("/match/{match_id}/answer")
async def answer(
    match_id: str,
    auth_data: WebAppInitData = Depends(auth),
    payload: dict = Body(...),
) -> JSONResponse:
    user = await check_user(auth_data.user.id)
    user_id = user.id

    submitted_answer = payload.get("answer")
    if submitted_answer is None:
        raise HTTPException(status_code=400, detail="Missing answer")
    if not submitted_answer.strip():
        raise HTTPException(status_code=400, detail="Empty answer")

    submitted_answer = submitted_answer.strip().lower()

    # Load match
    match = await CasualMatch.filter(id=match_id, user_id=user_id).first()
    if not match:
        raise HTTPException(status_code=404, detail="Match not found")
    if match.completed_at:
        raise HTTPException(status_code=400, detail="Match already completed")

    question = match.questions[match.current_question_idx]
    correct_answer = question["answer"].strip().lower()

    # Calculate elapsed time
    elapsed = None
    if match.current_question_started_at:
        elapsed = datetime.now(timezone.utc) - match.current_question_started_at

    # Handle timeout either by elapsed time or explicit "time expired" answer
    if (elapsed and elapsed.total_seconds() > 6) or submitted_answer == "time expired":
        await CasualAnswer.create(
            match=match,
            question_idx=match.current_question_idx,
            flag_id=question["flag_id"],
            user_answer="Time expired",
            is_correct=False,
        )

        match.current_question_idx += 1

        if match.current_question_idx >= match.num_questions:
            match.completed_at = datetime.now(timezone.utc)
            await complete_casual_match(match, user)
            await match.save()
            return JSONResponse(
                {
                    "correct": False,
                    "correct_answer": correct_answer,
                    "finished": True,
                    "current_question": None,
                    "score": match.score,
                }
            )
        else:
            match.current_question_started_at = datetime.now(timezone.utc)
            await match.save()
            next_q = match.questions[match.current_question_idx]
            return JSONResponse(
                {
                    "correct": False,
                    "correct_answer": correct_answer,
                    "finished": False,
                    "current_question": {
                        "index": match.current_question_idx,
                        "image": next_q["image"],
                        "options": next_q["options"],
                        "mode": next_q["mode"],
                    },
                    "score": match.score,
                }
            )

    # Process normal answer
    is_correct = submitted_answer == correct_answer

    await CasualAnswer.create(
        match=match,
        question_idx=match.current_question_idx,
        flag_id=question["flag_id"],
        user_answer=submitted_answer,
        is_correct=is_correct,
    )

    if is_correct:
        match.score += 1

    match.current_question_idx += 1

    if match.current_question_idx >= match.num_questions:
        match.completed_at = datetime.now(timezone.utc)
        await complete_casual_match(match, user)
        await match.save()
        return JSONResponse(
            {
                "correct": is_correct,
                "correct_answer": correct_answer,
                "finished": True,
                "current_question": None,
                "score": match.score,
            }
        )
    else:
        match.current_question_started_at = datetime.now(timezone.utc)
        await match.save()
        next_q = match.questions[match.current_question_idx]
        return JSONResponse(
            {
                "correct": is_correct,
                "correct_answer": correct_answer,
                "finished": False,
                "current_question": {
                    "index": match.current_question_idx,
                    "image": next_q["image"],
                    "options": next_q["options"],
                    "mode": next_q["mode"],
                },
                "score": match.score,
            }
        )


@router.get("/match/{match_id}/summary")
async def get_summary(
    match_id: str, auth_data: WebAppInitData = Depends(auth)
) -> JSONResponse:
    user_id = auth_data.user.id
    match = await CasualMatch.filter(id=match_id, user_id=user_id).first()
    print(match)
    if not match:
        raise HTTPException(status_code=404, detail="Match not found")

    if not match.completed_at:
        raise HTTPException(status_code=400, detail="Match not completed yet")

    # Get all submitted answers
    answers = (
        await CasualAnswer.filter(match_id=match.id)
        .order_by("question_idx")
        .values("question_idx", "flag_id", "user_answer", "is_correct", "answered_at")
    )

    for i in answers:
        if i["answered_at"]:
            i["answered_at"] = i["answered_at"].isoformat()

    return JSONResponse(
        {
            "match_id": str(match.id),
            "score": match.score,
            "num_questions": match.num_questions,
            "completed_at": str(match.completed_at.isoformat()),
            "answers": answers,
        }
    )


@router.post("/match/{id}/submit")
async def submit_casual_match(
    id: str, auth_data: WebAppInitData = Depends(auth)
) -> JSONResponse:
    user = await check_user(auth_data.user.id)
    match = await CasualMatch.filter(id=id, user_id=user.id).first()
    if not match:
        raise HTTPException(404, "Match not found")
    if match.completed_at:
        raise HTTPException(400, "Match already completed")

    await complete_casual_match(match, user)

    return JSONResponse({"message": "Match submitted successfully"})


async def complete_casual_match(match, user) -> None:
    match.completed_at = datetime.now(timezone.utc)
    user.casual_score += match.score
    user.today_casual_score += match.score
    # Adjust tries or do other logic here
    if match.score < match.num_questions / 2:
        user.tries_left -= 1

    await user.save()
    await match.save()
