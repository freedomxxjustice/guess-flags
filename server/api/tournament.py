from db import (
    Tournament,
    TournamentParticipant,
)
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import JSONResponse
from aiogram.utils.web_app import WebAppInitData
from aiogram.methods import CreateInvoiceLink
from aiogram.types import (
    LabeledPrice,
)
from datetime import datetime, timedelta, timezone
from config_reader import bot
from .utils import auth

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
        }
    )


@router.get("/all")
async def get_all_tournaments() -> JSONResponse:
    tournaments = (
        await Tournament.all()
        .order_by("-created_at")
        .prefetch_related("participants__user")
    )

    if not tournaments:
        raise HTTPException(status_code=404, detail="No tournaments found")

    tournaments_data = []
    for tournament in tournaments:
        participant_list = []
        for p in tournament.participants:
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
                "prizes": tournament.prizes or [],
                "participants": participant_list,
                "participation_cost": tournament.participation_cost,
                "min_participants": tournament.min_participants,
                "num_questions": tournament.num_questions,
                "gamemode": tournament.gamemode,
                "category": tournament.category,
                "tags": tournament.tags,
                "difficulty_multiplier": tournament.difficulty_multiplier,
                "base_score": tournament.base_score,
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
