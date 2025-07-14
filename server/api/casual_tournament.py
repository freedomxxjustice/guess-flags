from db import (
    Tournament,
    TournamentSchema,
    TournamentParticipant,
    TournamentParticipantSchema,
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
from .utils import auth, check_user

router = APIRouter(
    prefix="/api/tournaments/casual/everyday", dependencies=[Depends(auth)]
)


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

    # Use the participants relation directly, since prefetch_related loaded them
    participants = today_tournament.participants

    participant_list = []
    for p in participants:
        # 'p.user' is loaded thanks to prefetch_related
        participant_list.append(
            {
                "id": p.id,
                "user_id": p.user_id,
                "username": p.user.name,  # <-- should work now
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
            "prizes": today_tournament.prizes or [],
            "participants": participant_list,
            "type": today_tournament.type,
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
            "participation_cost": today_tournament.participation_cost,
            "min_participants": today_tournament.min_participants,
        }
    )


@router.get("/all")
async def get_all_tournaments() -> JSONResponse:
    # Fetch ALL tournaments, ordered by creation date descending
    tournaments = (
        await Tournament.all()
        .order_by("-created_at")
        .prefetch_related("participants__user")
    )

    if not tournaments:
        raise HTTPException(status_code=404, detail="No tournaments found")

    tournaments_data = []
    for tournament in tournaments:
        participants = tournament.participants

        participant_list = []
        for p in participants:
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
                "finished_at": (
                    tournament.finished_at.isoformat()
                    if tournament.finished_at
                    else None
                ),
                "prizes": tournament.prizes or [],
                "participants": participant_list,
                "type": tournament.type,
                "started_at": (
                    tournament.started_at.isoformat() if tournament.started_at else None
                ),
                "participation_cost": tournament.participation_cost,
                "min_participants": tournament.min_participants,
            }
        )

    return JSONResponse(tournaments_data)


@router.post("/{tournament_id}/participate")
async def participate(tournament_id: int, auth_data: WebAppInitData = Depends(auth)):
    tournament = await Tournament.filter(id=tournament_id).first()
    tournament_participation_cost = tournament.participation_cost
    if tournament_participation_cost > 0:
        existing_participant = await TournamentParticipant.filter(
            tournament_id=tournament_id, user_id=auth_data.user.id
        ).first()

        if existing_participant:
            return JSONResponse({"message": "You are already participating."})

        invoice_link = await bot(
            CreateInvoiceLink(
                title="Participation in tournament",
                description=f"Tournament #{tournament_id}",
                payload=f"tournament_{tournament_id}",
                currency="XTR",
                prices=[
                    LabeledPrice(label="XTR", amount=tournament_participation_cost)
                ],
            )
        )

        return JSONResponse({"invoice_link": invoice_link})
    else:
        existing_participant = await TournamentParticipant.filter(
            tournament_id=tournament_id, user_id=auth_data.user.id
        ).first()

        if existing_participant:
            return JSONResponse({"message": "You are already participating."})

        # Create participant record
        participant = await TournamentParticipant.create(
            tournament_id=tournament_id,
            user_id=auth_data.user.id,
            score=0,  # initial score
            place=None,
            prize=None,
        )

        return JSONResponse(
            {"message": "Participation confirmed", "participant_id": participant.id}
        )
