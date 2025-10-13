import asyncio
from tortoise import Tortoise
from api import cronjobs
from config_reader import config

TORTOISE_ORM = {
    "connections": {"default": config.DB_URL.get_secret_value()},
    "apps": {
        "models": {
            "models": [
                "db.models.user",
                "db.models.flag",
                "db.models.match",
                "db.models.tournament",
                "db.models.season",
                "db.models.achievement",
                "aerich.models",
            ],
            "default_connection": "default",
        },
    },
}


async def main():
    # инициализация ORM
    await Tortoise.init(TORTOISE_ORM)
    await Tortoise.generate_schemas()  # если нужно создать таблицы, иначе можно убрать

    # запуск задач
    await cronjobs.reset_today_casual_score()
    await cronjobs.end_season_if_needed()

    # закрытие соединений
    await Tortoise.close_connections()


if __name__ == "__main__":
    asyncio.run(main())
