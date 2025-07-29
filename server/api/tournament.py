from datetime import datetime, timedelta, timezone

from random import sample, shuffle
from typing import List
from db import Tournament, TournamentParticipant, Match, Flag
from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import JSONResponse
from aiogram.utils.web_app import WebAppInitData
from aiogram.methods import CreateInvoiceLink
from aiogram.types import (
    LabeledPrice,
)
from config_reader import bot
from .utils import auth, check_user

router = APIRouter(prefix="/api/tournaments", dependencies=[Depends(auth)])


@router.get("/today")
async def get_today_tournament() -> JSONResponse:
    now = datetime.now(timezone.utc)
    start_of_today = datetime(
        year=now.year, month=now.month, day=now.day, tzinfo=timezone.utc
    )
    start_of_tomorrow = start_of_today + timedelta(days=1)

    today_tournament = (
        await Tournament.filter(
            created_at__gte=start_of_today,
            created_at__lt=start_of_tomorrow,
            finished_at=None,
        )
        .prefetch_related("participants__user")
        .first()
    )

    if not today_tournament:
        raise HTTPException(status_code=404, detail="No active tournament today")

    participant_list = []
    for p in today_tournament.participants:
        participant_list.append(
            {
                "id": p.id,
                "user_id": p.user_id,
                "username": p.user.name,
                "score": p.score,
                "place": p.place,
                "prize": p.prize,
            }
        )

    return JSONResponse(
        {
            "tournament_id": today_tournament.id,
            "tournament_name": today_tournament.name,
            "created_at": today_tournament.created_at.isoformat(),
            "started_at": (
                today_tournament.started_at.isoformat()
                if today_tournament.started_at
                else None
            ),
            "finished_at": (
                today_tournament.finished_at.isoformat()
                if today_tournament.finished_at
                else None
            ),
            "will_finish_at": today_tournament.will_finish_at.isoformat(),
            "type": today_tournament.type,
            "prizes": today_tournament.prizes or [],
            "participants": participant_list,
            "participation_cost": today_tournament.participation_cost,
            "min_participants": today_tournament.min_participants,
            "num_questions": today_tournament.num_questions,
            "gamemode": today_tournament.gamemode,
            "category": today_tournament.category,
            "tags": today_tournament.tags,
            "difficulty_multiplier": today_tournament.difficulty_multiplier,
            "base_score": today_tournament.base_score,
            "tries": today_tournament.tries,
        }
    )


@router.get("/all")
async def get_all_tournaments() -> JSONResponse:
    now = datetime.now(timezone.utc)

    tournaments = (
        await Tournament.all()
        .filter(finished_at__isnull=True)
        .order_by("-created_at")
        .prefetch_related("participants__user", "prize_slots__prize")
    )

    active_tournaments = []
    for t in tournaments:
        if t.will_finish_at and t.will_finish_at < now:
            t.finished_at = now
            await t.save()
        else:
            active_tournaments.append(t)

    if not active_tournaments:
        raise HTTPException(status_code=404, detail="No active tournaments found")

    tournaments_data = []
    for tournament in active_tournaments:
        participant_list = [
            {
                "id": p.id,
                "user_id": p.user_id,
                "username": p.user.name,
                "score": p.score,
                "place": p.place,
                "prize": p.prize,
            }
            for p in tournament.participants
        ]

        prize_slots = await tournament.prize_slots.all().prefetch_related("prize")

        tournaments_data.append(
            {
                "tournament_id": tournament.id,
                "tournament_name": tournament.name,
                "created_at": tournament.created_at.isoformat(),
                "started_at": (
                    tournament.started_at.isoformat() if tournament.started_at else None
                ),
                "finished_at": (
                    tournament.finished_at.isoformat()
                    if tournament.finished_at
                    else None
                ),
                "will_finish_at": tournament.will_finish_at.isoformat(),
                "type": tournament.type,
                "prizes": [
                    {
                        "place": tp.place,
                        "type": tp.prize.type,
                        "title": tp.prize.title,
                        "link": tp.prize.link,
                        "media_url": tp.prize.media_url,
                        "description": tp.prize.description,
                        "metadata": tp.prize.metadata,
                    }
                    for tp in prize_slots
                ],
                "participants": participant_list,
                "participation_cost": tournament.participation_cost,
                "min_participants": tournament.min_participants,
                "num_questions": tournament.num_questions,
                "gamemode": tournament.gamemode,
                "category": tournament.category,
                "tags": tournament.tags,
                "difficulty_multiplier": tournament.difficulty_multiplier,
                "base_score": tournament.base_score,
                "tries": tournament.tries,
            }
        )

    return JSONResponse(tournaments_data)


@router.post("/{tournament_id}/participate")
async def participate(tournament_id: int, auth_data: WebAppInitData = Depends(auth)):
    tournament = await Tournament.filter(id=tournament_id).first()

    if not tournament:
        return JSONResponse({"message": "Tournament not found"}, status_code=404)

    existing_participant = await TournamentParticipant.filter(
        tournament_id=tournament_id, user_id=auth_data.user.id
    ).first()

    if existing_participant:
        return JSONResponse({"message": "You are already participating."})

    if tournament.participation_cost > 0:
        invoice_link = await bot(
            CreateInvoiceLink(
                title="Participation in tournament",
                description=f"Tournament #{tournament_id}",
                payload=f"tournament_{tournament_id}",
                currency="XTR",
                prices=[
                    LabeledPrice(label="XTR", amount=tournament.participation_cost)
                ],
            )
        )
        return JSONResponse({"invoice_link": invoice_link})

    participant = await TournamentParticipant.create(
        tournament_id=tournament_id,
        user_id=auth_data.user.id,
        score=0,
        place=None,
        prize=None,
        tries_left=tournament.tries,
    )

    current_count = await TournamentParticipant.filter(
        tournament_id=tournament_id
    ).count()

    if current_count >= tournament.min_participants and tournament.started_at is None:
        tournament.started_at = datetime.now(timezone.utc)
        await tournament.save(update_fields=["started_at"])

    return JSONResponse(
        {
            "message": "Participation confirmed",
            "participant_id": participant.id,
            "total_participants": current_count,
            "tournament_started": tournament.started_at is not None,
        }
    )


@router.post("/{tournament_id}/start")
async def start_tournament_match(
    tournament_id: int,
    auth_data: WebAppInitData = Depends(auth),
):
    user = await check_user(auth_data.user.id)

    tournament = await Tournament.get_or_none(id=tournament_id).prefetch_related(
        "participants"
    )
    if not tournament:
        raise HTTPException(404, detail="Tournament not found")

    if tournament.finished_at or tournament.will_finish_at < datetime.now(timezone.utc):
        raise HTTPException(400, detail="Tournament has already finished")

    if not tournament.started_at:
        raise HTTPException(400, detail="Tournament has not started yet")

    participant = await TournamentParticipant.get_or_none(
        tournament_id=tournament.id, user_id=user.id
    )
    if not participant:
        raise HTTPException(403, detail="You are not registered in this tournament")

    participant = await TournamentParticipant.get_or_none(
        user=user, tournament=tournament
    )

    if not participant:
        raise HTTPException(403, detail="You're not participating in this tournament.")

    if participant.tries_left <= 0:
        raise HTTPException(403, detail="No tries left in this tournament.")

    existing_match = await Match.get_or_none(
        user=user,
        tournament=tournament,
        match_type="tournament",
        completed_at__isnull=True,
    )

    if existing_match:
        raise HTTPException(
            400, detail="You already have an active match in this tournament."
        )

    question_list = await create_tournament_questions(
        tournament.num_questions,
        tournament.category,
        tournament.gamemode,
        tournament.tags,
    )

    match = await Match.create(
        user=user,
        num_questions=tournament.num_questions,
        questions=question_list,
        created_at=datetime.now(timezone.utc),
        current_question_started_at=datetime.now(timezone.utc),
        gamemode=tournament.gamemode,
        category=tournament.category,
        tags=tournament.tags,
        match_type="tournament",
        tournament=tournament,
        participant=participant,
        base_score=tournament.base_score,
        difficulty_multiplier=tournament.difficulty_multiplier,
    )

    participant.tries_left -= 1
    await participant.save()

    return JSONResponse(
        {
            "match_id": str(match.id),
            "num_questions": tournament.num_questions,
            "current_question": {
                "index": 0,
                "flag_id": question_list[0]["flag_id"],
                "image": question_list[0]["image"],
                "options": question_list[0]["options"],
                "mode": question_list[0]["mode"],
            },
        }
    )


async def create_tournament_questions(num_questions, category, gamemode, tags) -> List:
    flags_qs = Flag.all()

    if category and category != "frenzy":
        flags_qs = flags_qs.filter(category=category)

    if tags:
        flags_qs = flags_qs.filter(tags__name__in=tags).distinct()

    all_flags = await flags_qs.prefetch_related("tags")
    all_ids = [f.id for f in all_flags]

    if len(all_ids) < num_questions:
        raise HTTPException(400, "Not enough flags to create questions")

    question_ids = sample(all_ids, num_questions)

    questions = []
    for qid in question_ids:
        flag = next(f for f in all_flags if f.id == qid)
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
