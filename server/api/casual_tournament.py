from random import shuffle, sample
from typing import List
from db import (
    CasualEverydayTournament,
    CasualEverydayTournamentSchema,
    CasualEverydayTournamentParticipant,
    CasualEverydayTournamentParticipantSchema,
)
from fastapi import APIRouter, Request, Depends, HTTPException, Query, Body
from fastapi.responses import JSONResponse
from aiogram.utils.web_app import WebAppInitData
from aiogram.methods import CreateInvoiceLink
from aiogram.types import (
    LabeledPrice,
)
from .utils import auth, check_user
from datetime import datetime, timedelta, timezone
from config_reader import bot

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

    # Query tournaments created today and not yet finished
    today_tournament = await CasualEverydayTournament.filter(
        created_at__gte=start_of_today,
        created_at__lt=start_of_tomorrow,
        finished_at=None,
    ).first()

    print(today_tournament)

    if not today_tournament:
        raise HTTPException(status_code=404, detail="No active tournament today")

    return JSONResponse(
        {
            "tournament_id": today_tournament.id,
            "created_at": today_tournament.created_at,
            "prized": today_tournament.prizes,
            "participants": today_tournament.participants,
        }
    )


@router.post("/{tournament_id}/participate")
async def participate(tournament_id: int, auth_data: WebAppInitData = Depends(auth)):
    tournament = await CasualEverydayTournament.filter(id=tournament_id).first()
    tournament_participation_cost = tournament.participation_cost
    if tournament_participation_cost > 0:
        invoice_link = await bot(
            invoice_link=await bot(
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
        )
        return JSONResponse({"invoice_link": invoice_link})
    else:
        existing_participant = await CasualEverydayTournamentParticipant.filter(
            tournament_id=tournament_id, user_id=auth_data.user.id
        ).first()

        if existing_participant:
            return JSONResponse({"message": "You are already participating."})

        # Create participant record
        participant = await CasualEverydayTournamentParticipant.create(
            tournament_id=tournament_id,
            user_id=auth_data.user.id,
            score=0,  # initial score
            place=None,
            prize=None,
        )

        return JSONResponse(
            {"message": "Participation confirmed", "participant_id": participant.id}
        )
