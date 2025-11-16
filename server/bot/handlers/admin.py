from datetime import datetime, timezone
from json import loads as json_loads, JSONDecodeError
import json
from aiogram import Router, types
from aiogram.types import Message
from aiogram.filters import Command
from config_reader import bot
from db import Tournament, SeasonPrize, TournamentPrize, Season, Prize, User
from tortoise.exceptions import ValidationError
from config_reader import config
from tortoise.transactions import in_transaction

router = Router(name="admin")
ADMIN_IDS = {config.ADMIN_ID}

LEADER_REWARDS = [9, 6, 3]
BONUS_TRIES = [
    (1, 1, 15),
    (2, 2, 12),
    (3, 3, 9),
    (4, 10, 6),
    (11, 20, 5),
    (21, 30, 4),
    (31, 40, 3),
    (41, 50, 2),
]


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

    if prizes is not None:
        for prize_entry in prizes:
            try:
                prize_obj = await Prize.get_or_none(
                    type=prize_entry["type"],
                    link=prize_entry.get("link"),
                    title=prize_entry.get("title"),
                )

                if not prize_obj:
                    prize_obj = await Prize.create(
                        type=prize_entry["type"],
                        title=prize_entry.get(
                            "title", f"{prize_entry['type'].title()} Prize"
                        ),
                        description=prize_entry.get("description"),
                        media_url=prize_entry.get("media_url"),
                        link=prize_entry.get("link"),
                        metadata=prize_entry.get("metadata"),
                    )

                await TournamentPrize.create(
                    tournament=tournament,
                    prize=prize_obj,
                    place=prize_entry.get("place", 1),
                )
            except KeyError as e:
                await message.answer(f"❌ Missing prize field: {e}")
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


@router.message(Command("add_tournament_json"))
async def add_tournament_json(message: Message):
    if message.from_user.id not in ADMIN_IDS:
        await message.answer("🚫 You are not authorized to use this command.")
        return

    try:
        data = json_loads(
            message.text.strip().removeprefix("/add_tournament_json").strip()
        )
    except JSONDecodeError as e:
        await message.answer(f"⚠️ Invalid JSON: {e}")
        return

    try:
        tournament = await Tournament.create(
            name=data["name"],
            type=data.get("type", "casual_daily"),
            participation_cost=int(data.get("cost", 0)),
            min_participants=int(data.get("min", 0)),
            num_questions=int(data.get("num_questions", 10)),
            gamemode=data.get("gamemode", "choose"),
            category=data.get("category", "country"),
            tags=data.get("tags", []),
            difficulty_multiplier=float(data.get("difficulty", 1.0)),
            base_score=int(data.get("base", 0)),
            tries=data.get("tries", 1),
            will_finish_at=(
                datetime.fromisoformat(data["will_finish_at"])
                if "will_finish_at" in data
                else None
            ),
        )
    except (ValidationError, ValueError, KeyError) as e:
        await message.answer(f"❌ Error creating tournament: {e}")
        return

    for prize in data.get("prizes", []):
        try:
            prize_obj = await Prize.get_or_none(
                type=prize["type"],
                link=prize.get("link"),
                title=prize.get("title"),
            )
            if not prize_obj:
                prize_obj = await Prize.create(
                    type=prize["type"],
                    title=prize.get("title", f"{prize['type'].title()} Prize"),
                    description=prize.get("description"),
                    media_url=prize.get("media_url"),
                    link=prize.get("link"),
                    metadata=prize.get("metadata"),
                )
            await TournamentPrize.create(
                tournament=tournament,
                prize=prize_obj,
                place=prize.get("place", 1),
            )
        except KeyError as e:
            await message.answer(f"⚠️ Prize missing field: {e}")
            return

    await message.answer(
        f"✅ Tournament '{tournament.name}' created successfully!\n"
        f"ID: {tournament.id}\n"
        f"Type: {tournament.type}\n"
        f"Prizes: {len(data.get('prizes', []))}\n"
        f"Ends: {tournament.will_finish_at or 'N/A'}"
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

    tournament = (
        await Tournament.filter(id=tournament_id, finished_at=None)
        .prefetch_related("participants__user")
        .first()
    )
    if not tournament:
        await message.answer("❌ Tournament not found or already finished.")
        return

    participants = list(tournament.participants)
    participants.sort(key=lambda p: p.score, reverse=True)

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


@router.message(Command("add_season"))
async def add_season(message: Message):
    if message.from_user.id not in ADMIN_IDS:
        await message.answer("🚫 You are not authorized to use this command.")
        return

    args_text = message.text.strip()
    if args_text.startswith("/add_season"):
        args_text = args_text[len("/add_season") :].strip()

    if not args_text:
        await message.answer(
            '⚠️ Usage example:\n/add_season \'{"title":"Summer2025","start_date":"2025-08-01","end_date":"2025-08-31","prizes":[]}\''
        )
        return

    try:
        data = json.loads(args_text)
        title = data["title"]
        start_date = datetime.fromisoformat(data["start_date"]).date()
        end_date = datetime.fromisoformat(data["end_date"]).date()
        prizes = data.get("prizes", [])
    except (KeyError, ValueError, JSONDecodeError) as e:
        await message.answer(f"⚠️ Invalid JSON or missing fields: {e}")
        return

    try:
        season = await Season.create(
            title=title, start_date=start_date, end_date=end_date
        )
    except (ValidationError, ValueError) as e:
        await message.answer(f"❌ Error creating season: {e}")
        return

    for prize_entry in prizes:
        try:
            await SeasonPrize.create(
                season=season,
                title=prize_entry.get("title", "Season Prize"),
                link=prize_entry.get("link"),
                place=prize_entry.get("place", 1),
                quantity=prize_entry.get("quantity", 1),
            )
        except (KeyError, ValidationError) as e:
            await message.answer(f"⚠️ Prize missing or invalid field: {e}")
            return

    await message.answer(
        f"✅ Season '{season.title}' created!\n"
        f"ID: {season.id}\n"
        f"Start: {season.start_date}\n"
        f"End: {season.end_date}\n"
        f"Prizes: {len(prizes)}"
    )


@router.message(Command("force_end"))
async def cmd_force_end(message: types.Message):
    if message.from_user.id not in ADMIN_IDS:
        return await message.reply("⛔ У вас нет прав для этой команды.")

    args = message.text.split()
    if len(args) < 2 or not args[1].isdigit():
        return await message.reply("Использование: /force_end <season_id>")

    season_id = int(args[1])
    await force_season_end(season_id)
    await message.reply(f"✅ Сезон #{season_id} завершён вручную.")


async def end_season(season: Season):
    print(f"Ending season: {season.title}")
    summary_lines = [f"🏁 Season '{season.title}' ended!"]

    async with in_transaction():
        top_users = await User.all().order_by("-total_score").limit(50)

        for idx, user in enumerate(top_users, start=1):
            message_text = ""

            for start, end, tries in BONUS_TRIES:
                if start <= idx <= end:
                    user.tries_left += tries
                    message_text = (
                        f"🎁 Hi {user.name}! You finished #{idx} in season '{season.title}' "
                        f"and received {tries} bonus tries."
                    )
                    summary_lines.append(f"{idx}. {user.name} → {tries} bonus tries")
                    break

            await user.save()

            if message_text:
                try:
                    await bot.send_message(chat_id=user.id, text=message_text)
                except Exception as e:
                    print(f"Failed to send message to {user.name}: {e}")

        season.is_active = False
        await season.save()

    summary_text = "\n".join(summary_lines)

    try:
        await bot.send_message(chat_id=config.ADMIN_ID, text=summary_text)
    except Exception as e:
        print(f"Failed to send summary to admin {config.ADMIN_ID}: {e}")
    print(f"Season '{season.title}' ended and rewards distributed.")


async def force_season_end(season_id: int):
    """Принудительное завершение сезона администратором."""
    season = await Season.filter(id=season_id, is_active=True).first()
    if not season:
        print(f"⚠️ Season {season_id} not found or already inactive.")
        return

    await end_season(season)
