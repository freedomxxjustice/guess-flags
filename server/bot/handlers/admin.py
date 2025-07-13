from aiogram import Router
from aiogram.types import Message
from aiogram.filters import Command
from datetime import datetime, timezone
from db import CasualEverydayTournament, CasualEverydayTournamentParticipant
from config_reader import bot

router = Router(name="admin")
ADMIN_IDS = {938450625}

admin_router = Router(name="admin")


@router.message(Command("create_tournament"))
async def create_tournament(message: Message):
    # Check if sender is admin
    if message.from_user.id not in ADMIN_IDS:
        await message.answer("🚫 You are not authorized to use this command.")
        return

    # Parse arguments
    args = message.text.strip().split(maxsplit=2)
    if len(args) < 3:
        await message.answer("⚠️ Usage:\n/create_tournament <name> <participation_cost>")
        return

    name = args[1]
    try:
        participation_cost = int(args[2])
    except ValueError:
        await message.answer("⚠️ Participation cost must be a number.")
        return

    # Create tournament
    tournament = await CasualEverydayTournament.create(
        name=name,
        participation_cost=participation_cost,
        prizes=None,
    )

    await message.answer(
        f"✅ Tournament created!\n\n"
        f"ID: {tournament.id}\n"
        f"Name: {tournament.name}\n"
        f"Participation cost: {tournament.participation_cost}"
    )


@router.message(Command("finish_tournament"))
async def finish_tournament(message: Message):
    if message.from_user.id not in ADMIN_IDS:
        await message.answer("🚫 You are not authorized to use this command.")
        return

    args = message.text.strip().split(maxsplit=1)
    if len(args) < 2:
        await message.answer("⚠️ Usage:\n/finish_tournament <tournament_id>")
        return

    try:
        tournament_id = int(args[1])
    except ValueError:
        await message.answer("⚠️ Tournament ID must be a number.")
        return

    # Load the tournament
    tournament = (
        await CasualEverydayTournament.filter(id=tournament_id, finished_at=None)
        .prefetch_related("participants__user")
        .first()
    )
    if not tournament:
        await message.answer("❌ Tournament not found or already finished.")
        return

    # Sort participants by score descending
    participants = list(tournament.participants)
    participants.sort(key=lambda p: p.score, reverse=True)

    # Assign places and notify participants
    for idx, participant in enumerate(participants, start=1):
        participant.place = idx
        await participant.save()

        await bot.send_message(
            participant.user_id,
            f"🎯 The tournament '{tournament.name}' has finished!\n"
            f"Your place: #{idx}\n"
            f"Your score: {participant.score}",
        )

    tournament.finished_at = datetime.now(timezone.utc)
    await tournament.save()

    await message.answer(
        f"✅ Tournament '{tournament.name}' (ID {tournament.id}) finished.\n"
        f"Participants have been notified."
    )
