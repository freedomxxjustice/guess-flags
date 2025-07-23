from datetime import datetime, timezone
from json import loads as json_loads, JSONDecodeError
from aiogram import Router
from aiogram.types import Message
from aiogram.filters import Command
from db import Tournament, TournamentParticipant
from config_reader import bot
from tortoise.exceptions import ValidationError

router = Router(name="admin")
ADMIN_IDS = {938450625}


def parse_args_to_dict(args: list[str]) -> dict:
    parsed = {}
    for arg in args:
        if "=" not in arg:
            continue
        key, value = arg.split("=", 1)
        parsed[key.strip()] = value.strip()
    return parsed


@router.message(Command("add_tournament"))
async def add_tournament(message: Message):
    if message.from_user.id not in ADMIN_IDS:
        await message.answer("🚫 You are not authorized to use this command.")
        return

    args_text = message.text.strip().removeprefix("/add_tournament").strip()
    if not args_text:
        await message.answer(
            "⚠️ Usage example:\n/add_tournament name=SummerCup type=casual_daily cost=100 min=5 will_finish_at=2025-08-01T18:00"
        )
        return

    args_dict = parse_args_to_dict(args_text.split())

    try:
        name = args_dict["name"].replace("_", " ")
    except KeyError:
        await message.answer("⚠️ 'name' is required.")
        return

    try:
        will_finish_at = (
            datetime.fromisoformat(args_dict.get("will_finish_at"))
            if "will_finish_at" in args_dict
            else None
        )
    except ValueError:
        await message.answer(
            "⚠️ Invalid ISO format for will_finish_at. Example: 2025-07-30T20:00"
        )
        return

    try:
        prizes = json_loads(args_dict["prizes"]) if "prizes" in args_dict else None
        if prizes and not isinstance(prizes, list):
            raise ValueError("Prizes must be a JSON array")
    except (JSONDecodeError, ValueError) as e:
        await message.answer(f"⚠️ Invalid 'prizes': {e}")
        return

    try:
        tournament = await Tournament.create(
            name=name,
            type=args_dict.get("type", "casual_daily"),
            participation_cost=int(args_dict.get("cost", 0)),
            min_participants=int(args_dict.get("min", 0)),
            num_questions=int(args_dict.get("num_questions", 10)),
            gamemode=args_dict.get("gamemode", "choose"),
            category=args_dict.get("category", "country"),
            tags=json_loads(args_dict["tags"]) if "tags" in args_dict else [],
            difficulty_multiplier=float(args_dict.get("difficulty", 1.0)),
            base_score=int(args_dict.get("base", 0)),
            prizes=prizes,
            tries=args_dict.get("tries", 1),
            will_finish_at=will_finish_at,
        )
    except (ValidationError, ValueError) as e:
        await message.answer(f"❌ Error creating tournament: {e}")
        return

    await message.answer(
        f"✅ Tournament created!\n"
        f"ID: {tournament.id}\n"
        f"Name: {tournament.name}\n"
        f"Type: {tournament.type}\n"
        f"Gamemode: {tournament.gamemode}\n"
        f"Category: {tournament.category}\n"
        f"Min participants: {tournament.min_participants}\n"
        f"Participation cost: {tournament.participation_cost}\n"
        f"Questions: {tournament.num_questions}\n"
        f"Tags: {tournament.tags}\n"
        f"Base score: {tournament.base_score}\n"
        f"Finish time: {tournament.will_finish_at or 'N/A'}"
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
