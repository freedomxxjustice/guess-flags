from datetime import date
from tortoise.transactions import in_transaction
from db import User, Season, SeasonPrize
from config_reader import bot  # импорт вашего Aiogram Bot
from config_reader import config
# количество попыток для лидеров
LEADER_REWARDS = [9, 6, 3]
BONUS_TRIES = [
    (11, 20, 4),
    (21, 30, 3),
    (31, 40, 2),
    (41, 50, 1),
]


async def reset_today_casual_score():
    """Сбрасываем today_casual_score и начисляем бонусы топ-3"""
    async with in_transaction():
        # Берём топ-3 по today_casual_score
        top_users = await User.all().order_by("-today_casual_score").limit(3)

        for idx, user in enumerate(top_users):
            bonus_tries = LEADER_REWARDS[idx] if idx < len(LEADER_REWARDS) else 0
            user.tries_left += bonus_tries
            # Опционально: можно логировать награду или создать отдельную модель Reward
            print(
                f"Awarded {bonus_tries} tries to {user.name} (score={user.today_casual_score})"
            )
            await user.save()

        # Сбрасываем today_casual_score у всех пользователей
        await User.all().update(today_casual_score=0, last_reset_date=date.today())
        print("Today casual scores reset completed.")


async def end_season_if_needed():
    today = date.today()

    # Берём активный сезон, который закончился
    season = await Season.filter(end_date__lte=today).first()
    if not season:
        print("No season ended today.")
        return

    print(f"Ending season: {season.title}")
    summary_lines = [f"Season '{season.title}' ended. Winners:"]

    async with in_transaction():
        top_users = await User.all().order_by("-total_score").limit(50)

        for idx, user in enumerate(top_users, start=1):
            message_text = ""
            if idx <= 10:
                # Топ-10 получают приз
                prize = await SeasonPrize.filter(season=season, place=idx).first()
                if prize:
                    message_text = (
                        f"🏆 Congratulations {user.name}! You finished #{idx} in season '{season.title}' "
                        f"and received prize: {prize.title}"
                    )
                    summary_lines.append(f"{idx}. {user.name} → {prize.title}")
            else:
                # 11–50 получают бонусные попытки
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

            # Отправляем сообщение пользователю (если он подписан)
            if message_text:
                try:
                    await bot.send_message(chat_id=user.id, text=message_text)
                except Exception as e:
                    print(f"Failed to send message to {user.name}: {e}")

        # Закрываем сезон
        season.is_active = False
        await season.save()

    # Отправляем тебе сводный список
    summary_text = "\n".join(summary_lines)
    for admin_id in config.ADMIN_ID:
        try:
            await bot.send_message(chat_id=admin_id, text=summary_text)
        except Exception as e:
            print(f"Failed to send summary to admin {admin_id}: {e}")

    print(f"Season '{season.title}' ended and rewards distributed.")
