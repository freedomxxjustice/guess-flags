from tortoise import Tortoise, run_async
from datetime import datetime, date
import random


NAMES = [
    "Alice Wonder",
    "Bob Builder",
    "Charlie Chocolate",
    "Daisy Duck",
    "Eve Online",
    "Frank Ocean",
    "Gina Galaxy",
    "Henry Hudson",
    "Ivy Indigo",
    "Jack Sparrow",
    "Kara Krypton",
    "Liam Lightning",
    "Mona Matrix",
    "Nina Neptune",
    "Oscar Orbit",
    "Paul Phoenix",
    "Quinn Quantum",
    "Rita Rocket",
    "Sam Star",
    "Tina Titan",
    "Uma Universe",
    "Vera Velocity",
    "Wade Wave",
    "Xena Xenon",
    "Yara Yonder",
    "Zane Zenith",
    "Nova Nimbus",
    "Orion Orbit",
    "Piper Pulse",
    "Quasar Quest",
    "Rex Rocket",
    "Sirius Spark",
    "Terra Tempo",
    "Ulysses Umbra",
    "Vega Vortex",
    "Willow Wisp",
    "Xander Xenith",
    "Yvette Yarn",
    "Zelda Zenith",
    "Apollo Arc",
    "Blaze Bolt",
    "Cascade Cloud",
    "Delta Drift",
    "Echo Ember",
    "Flare Frost",
    "Glitch Glide",
    "Halo Haze",
    "Ion Indigo",
    "Jade Jolt",
    "Kilo Knight",
]


async def seed_users():
    for i, name in enumerate(NAMES, start=1):
        score = random.randint(150, 500)
        tries = random.randint(0, 3)
        await User.create(
            id=i,  # or omit to autoincrement if you don't have Telegram IDs
            name=name,
            rating=random.randint(1000, 1600),
            games_played=random.randint(10, 200),
            games_won=random.randint(0, 100),
            total_score=score * random.randint(5, 15),
            best_score=score,
            casual_score=score,
            tries_left=tries,
            last_reset_date=date.today(),
        )
    print("✅ 50 fake users created.")


async def run():
    await seed_users()


if __name__ == "__main__":
    run_async(run())
