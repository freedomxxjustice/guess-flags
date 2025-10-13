from datetime import date
from tortoise.transactions import in_transaction
from db import User, Season, SeasonPrize
from config_reader import bot  # импорт вашего Aiogram Bot
from config_reader import config

LEADER_REWARDS = [9, 6, 3]
BONUS_TRIES = [
    (1, 10, 6),
    (11, 20, 5),
    (21, 30, 4),
    (31, 40, 3),
    (41, 50, 2),
]


async def reset_today_casual_score():
    """Сбрасываем today_casual_score и начисляем бонусы топ-3.
    Отправляем отчет администраторам.
    """
    async with in_transaction():
        top_users = await User.all().order_by("-today_casual_score").limit(3)

        summary_lines = [
            "📊 Ежедневный сброс очков завершён!",
            "",
            "🏅 Топ-3 лидеров дня:",
        ]

        for idx, user in enumerate(top_users):
            bonus_tries = LEADER_REWARDS[idx] if idx < len(LEADER_REWARDS) else 0
            user.tries_left += bonus_tries
            await user.save()

            summary_lines.append(
                f"{idx+1}. {user.name} — +{bonus_tries} попыток (счёт: {user.today_casual_score})"
            )
            print(
                f"Awarded {bonus_tries} tries to {user.name} (score={user.today_casual_score})"
            )

        await User.all().update(today_casual_score=0, last_reset_date=date.today())
        print("Today casual scores reset completed.")

        summary_text = "\n".join(summary_lines)

        for admin_id in config.ADMIN_ID:
            try:
                await bot.send_message(chat_id=admin_id, text=summary_text)
                print(f"Summary sent to admin {admin_id}")
            except Exception as e:
                print(f"Failed to send summary to admin {admin_id}: {e}")


async def end_season_if_needed():
    today = date.today()

    season = await Season.filter(end_date__lte=today, is_active=True).first()
    if not season:
        print("No season ended today.")
        return

    print(f"Ending season: {season.title}")
    summary_lines = [f"🏁 Season '{season.title}' ended!"]

    async with in_transaction():
        top_users = await User.all().order_by("-total_score").limit(50)

        for idx, user in enumerate(top_users, start=1):
            message_text = ""

            if idx <= 3:
                prize = await SeasonPrize.filter(season=season, place=idx).first()
                if prize:
                    message_text = (
                        f"🏆 Congratulations {user.name}! You finished #{idx} in season '{season.title}' "
                        f"and received the prize: {prize.title}"
                    )
                    summary_lines.append(f"{idx}. {user.name} → {prize.title}")
            else:
                for start, end, tries in BONUS_TRIES:
                    if start <= idx <= end:
                        user.tries_left += tries
                        message_text = (
                            f"🎁 Hi {user.name}! You finished #{idx} in season '{season.title}' "
                            f"and received {tries} bonus tries."
                        )
                        summary_lines.append(
                            f"{idx}. {user.name} → {tries} bonus tries"
                        )
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
    for admin_id in config.ADMIN_ID:
        try:
            await bot.send_message(chat_id=admin_id, text=summary_text)
        except Exception as e:
            print(f"Failed to send summary to admin {admin_id}: {e}")

    print(f"Season '{season.title}' ended and rewards distributed.")


