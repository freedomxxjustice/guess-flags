import asyncio
from api import cronjobs


async def main():
    await cronjobs.reset_today_casual_score()
    await cronjobs.end_season_if_needed()  


if __name__ == "__main__":
    asyncio.run(main())
