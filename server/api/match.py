from datetime import datetime, timezone
from random import shuffle, sample
from typing import List
from db import Flag, Match, MatchAnswer, TournamentParticipant
from fastapi import APIRouter, Depends, HTTPException, Query, Body
from fastapi.responses import JSONResponse
from aiogram.utils.web_app import WebAppInitData
from .utils import auth, check_user, calculate_multiplier, answer_map
from fuzzywuzzy import process
from math import ceil

router = APIRouter(prefix="/api/games", dependencies=[Depends(auth)])


@router.post("/casual/start")
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
    difficulty_multiplier = 1 if gamemode == "choose" else 1.5
    print(question_list)
    match = await Match.create(
        user=user,
        num_questions=num_questions,
        questions=question_list,
        started_at=datetime.now(timezone.utc),
        current_question_started_at=datetime.now(timezone.utc),
        gamemode=gamemode,
        tags=[""],
        difficulty_multiplier=difficulty_multiplier,
        base_score=0,
    )

    user.casual_games_played += 1
    await user.save()

    return JSONResponse(
        {
            "match_id": str(match.id),
            "num_questions": num_questions,
            "current_question": {
                "index": 0,
                "flag_id": question_list[0]["flag_id"],
                "image": question_list[0]["image"],
                "options": question_list[0]["options"],
                "mode": question_list[0]["mode"],
            },
        }
    )


async def create_casual_questions(
    num_questions: int, category: str, gamemode: str
) -> List[dict]:
    list_length = int(num_questions)
    if category == "cis":
        all_flags = await Flag.filter(
            category__in=["ru_regions", "ua_regions", "by_regions"]
        )
    elif category and category != "frenzy":
        all_flags = await Flag.filter(category=category)
    else:
        all_flags = await Flag.all()
        
    if len(all_flags) < list_length:
        raise HTTPException(
            status_code=400, detail="Not enough flags to create questions"
        )

    # Step 2: Разделяем флаги по сложности
    easy_flags = [f for f in all_flags if f.difficulty <= 0.33]
    medium_flags = [f for f in all_flags if 0.34 <= f.difficulty <= 0.66]
    hard_flags = [f for f in all_flags if f.difficulty > 0.66]

    # Step 3: Рассчитываем количество вопросов каждого типа
    num_easy = ceil(list_length * 0.33)
    num_medium = ceil(list_length * 0.33)
    num_hard = list_length - num_easy - num_medium  # остаток

    def sample_flags(pool, count):
        if len(pool) >= count:
            return sample(pool, count)
        else:
            # если не хватает, добираем случайными из всех флагов
            needed = count - len(pool)
            extra = sample([f for f in all_flags if f not in pool], needed)
            return pool + extra

    selected_flags = []
    selected_flags += sample_flags(easy_flags, num_easy)
    selected_flags += sample_flags(medium_flags, num_medium)
    selected_flags += sample_flags(hard_flags, num_hard)

    shuffle(selected_flags)

    # Step 4: Формируем вопросы
    questions = []
    for flag in selected_flags:
        incorrect_pool = [f for f in all_flags if f.id != flag.id]
        if len(incorrect_pool) < 6:
            raise HTTPException(status_code=400, detail="Not enough flags for options")
        incorrect_options = sample(incorrect_pool, 6)
        options = [f.name for f in incorrect_options] + [flag.name]
        shuffle(options)

        questions.append(
            {
                "flag_id": flag.id,
                "image": flag.image,
                "options": options,
                "mode": gamemode,
                "answer": flag.name,
                "difficulty": flag.difficulty,
            }
        )
    return questions


@router.get("/match/active")
async def get_match(
    auth_data: WebAppInitData = Depends(auth),
) -> JSONResponse:
    user = await check_user(auth_data.user.id)
    match = await Match.get_or_none(user_id=user.id, completed_at=None)

    if not match:
        return JSONResponse({"status": "Match not found!"})

    # Validate timer
    if match.current_question_started_at:
        elapsed = datetime.now(timezone.utc) - match.current_question_started_at
        if elapsed.total_seconds() > 15:
            await MatchAnswer.create(
                match=match,
                question_idx=match.current_question_idx,
                flag_id=match.questions[match.current_question_idx]["flag_id"],
                user_answer="Time expired",
                is_correct=False,
            )
            match.current_question_idx += 1
            if match.current_question_idx >= match.num_questions:
                match.completed_at = datetime.now(timezone.utc)
                await complete_match(match, user)
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

    submitted_answer_raw = submitted_answer.strip().lower()
    normalized_answer = answer_map.get(submitted_answer_raw)

    # If not found, apply fuzzy search
    if normalized_answer is None:
        best_match, score = process.extractOne(submitted_answer_raw, answer_map.keys())
        if score >= 80:  # adjustable threshold
            normalized_answer = answer_map[best_match]
        else:
            normalized_answer = submitted_answer_raw

    # Load match
    match = await Match.filter(id=match_id, user_id=user_id).first()
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
    if (elapsed and elapsed.total_seconds() > 15) or submitted_answer == "time expired":
        await MatchAnswer.create(
            match=match,
            question_idx=match.current_question_idx,
            flag_id=question["flag_id"],
            user_answer="Time expired",
            is_correct=False,
        )

        match.current_question_idx += 1

        if match.current_question_idx >= match.num_questions:
            match.completed_at = datetime.now(timezone.utc)
            await complete_match(match, user)
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

    is_correct = normalized_answer.strip().lower() == correct_answer.strip().lower()

    await MatchAnswer.create(
        match=match,
        question_idx=match.current_question_idx,
        flag_id=question["flag_id"],
        user_answer=submitted_answer,
        is_correct=is_correct,
    )
    await update_flag_stats(question["flag_id"], is_correct)

    if is_correct:
        difficulty = question.get("difficulty", 0.33)
        points = ceil(difficulty * 3)  # 1–3 очка
    else:
        points = 0

    match.base_score += points
    match.score = round(match.base_score * match.difficulty_multiplier)

    match.current_question_idx += 1

    if match.current_question_idx >= match.num_questions:
        match.completed_at = datetime.now(timezone.utc)
        await complete_match(match, user)
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
    match = await Match.filter(id=match_id, user_id=user_id).first()
    if not match:
        raise HTTPException(status_code=404, detail="Match not found")

    if not match.completed_at:
        raise HTTPException(status_code=400, detail="Match not completed yet")

    # Get all submitted answers
    answers = (
        await MatchAnswer.filter(match_id=match.id)
        .order_by("question_idx")
        .values(
            "question_idx",
            "flag_id",
            "user_answer",
            "is_correct",
            "answered_at",
        )
    )

    # Make a lookup dict for questions by index
    question_lookup = {idx: q for idx, q in enumerate(match.questions)}

    # Attach image to each answer
    for a in answers:
        if a["answered_at"]:
            a["answered_at"] = a["answered_at"].isoformat()

        q = question_lookup.get(a["question_idx"])
        a["image"] = q["image"] if q else None

    return JSONResponse(
        {
            "match_id": str(match.id),
            "score": match.score,
            "base_score": match.base_score,
            "difficulty_multiplier": match.difficulty_multiplier,
            "num_questions": match.num_questions,
            "completed_at": str(match.completed_at.isoformat()),
            "answers": answers,
        }
    )


@router.post("/match/{match_id}/submit")
async def submit_casual_match(
    match_id: str, auth_data: WebAppInitData = Depends(auth)
) -> JSONResponse:
    user = await check_user(auth_data.user.id)
    match = await Match.filter(id=match_id, user_id=user.id).first()
    if not match:
        raise HTTPException(404, "Match not found")
    if match.completed_at:
        raise HTTPException(400, "Match already completed")

    await complete_match(match, user)

    return JSONResponse({"message": "Match submitted successfully"})


async def complete_match(match: Match, user) -> None:
    match.completed_at = datetime.now(timezone.utc)

    # Store base score and apply multiplier
    match.base_score = match.score
    multiplier = calculate_multiplier(match.gamemode, match.tags)
    match.difficulty_multiplier = multiplier
    match.score = int(match.base_score * multiplier)

    # Tournament logic
    if match.match_type == "tournament" and match.participant_id:
        participant = await TournamentParticipant.get(id=match.participant_id)
        participant.score += match.score
        await participant.save()
    else:
        # Casual logic
        user.casual_score += match.score
        user.today_casual_score += match.score

        if match.score < match.num_questions / 2:
            user.tries_left -= 1

        await user.save()

    await match.save()


async def update_flag_stats(flag_id: int, is_correct: bool):
    flag = await Flag.get(id=flag_id)
    flag.total_shown += 1
    if is_correct:
        flag.total_correct += 1
    if flag.total_shown > 0:
        flag.difficulty = 1 - (flag.total_correct / flag.total_shown)
    await flag.save()
