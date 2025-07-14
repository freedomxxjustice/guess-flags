from aiogram import Router
from aiogram.types import Message
from aiogram.filters import Command
from datetime import datetime, timezone
from db import Tournament, TournamentParticipant
from config_reader import bot

router = Router(name="admin")
ADMIN_IDS = {938450625}

admin_router = Router(name="admin")


from json import loads as json_loads
from json import JSONDecodeError


@router.message(Command("create_tournament"))
async def create_tournament(message: Message):
    # Check if sender is admin
    if message.from_user.id not in ADMIN_IDS:
        await message.answer("🚫 You are not authorized to use this command.")
        return

    # Parse arguments
    args = message.text.strip().split(maxsplit=3)
    if len(args) < 3:
        await message.answer(
            "⚠️ Usage:\n/create_tournament <name> <participation_cost> [prizes_json]"
        )
        return

    name = args[1]

    try:
        participation_cost = int(args[2])
    except ValueError:
        await message.answer("⚠️ Participation cost must be a number.")
        return

    # Default to None if prizes not provided
    prizes = None

    if len(args) >= 4:
        try:
            prizes = json_loads(args[3])

            # Basic validation: must be a list
            if not isinstance(prizes, list):
                await message.answer("⚠️ Prizes must be a JSON array.")
                return

            # Validate each prize item
            for prize in prizes:
                if not isinstance(prize, dict):
                    await message.answer("⚠️ Each prize must be a JSON object.")
                    return

                if "place" not in prize or "type" not in prize:
                    await message.answer("⚠️ Each prize must have 'place' and 'type'.")
                    return

                if prize["type"] == "nft":
                    if "link" not in prize:
                        await message.answer("⚠️ NFT prizes must include 'link'.")
                        return
                elif prize["type"] != "nft":
                    if "quantity" not in prize:
                        await message.answer(
                            "⚠️ Non-NFT prizes must include 'quantity'."
                        )
                        return

        except JSONDecodeError:
            await message.answer("⚠️ Invalid JSON format for prizes.")
            return

    # Create tournament
    tournament = await Tournament.create(
        name=name,
        participation_cost=participation_cost,
        prizes=prizes,
    )

    await message.answer(
        f"✅ Tournament created!\n\n"
        f"ID: {tournament.id}\n"
        f"Name: {tournament.name}\n"
        f"Participation cost: {tournament.participation_cost}\n"
        f"Prizes: {prizes if prizes else 'None'}"
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
        await Tournament.filter(id=tournament_id, finished_at=None)
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
        if idx > 3:
            await bot.send_message(
                participant.user_id,
                f"🎯 The tournament '{tournament.name}' has finished!\n"
                f"Your place: #{idx}\n"
                f"Your score: {participant.score}",
            )
        else:
            if idx == 1:
                await bot.send_message(
                    participant.user_id,
                    f"🎯 The tournament '{tournament.name}' has finished!\n"
                    f"Your place: #{idx} 🥇\n"
                    f"Your score: {participant.score}",
                )
            elif idx == 2:
                await bot.send_message(
                    participant.user_id,
                    f"🎯 The tournament '{tournament.name}' has finished!\n"
                    f"Your place: #{idx} 🥈\n"
                    f"Your score: {participant.score}",
                )
            elif idx == 3:
                await bot.transfer_gift
                await bot.send_message(
                    participant.user_id,
                    f"🎯 The tournament '{tournament.name}' has finished!\n"
                    f"Your place: #{idx} 🥉\n"
                    f"Your score: {participant.score}",
                )

    tournament.finished_at = datetime.now(timezone.utc)
    await tournament.save()

    await message.answer(
        f"✅ Tournament '{tournament.name}' (ID {tournament.id}) finished.\n"
        f"Participants have been notified."
    )
