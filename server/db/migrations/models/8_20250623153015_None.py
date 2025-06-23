from tortoise import BaseDBAsyncClient


async def upgrade(db: BaseDBAsyncClient) -> str:
    return """
        CREATE TABLE IF NOT EXISTS "users" (
    "id" BIGSERIAL NOT NULL PRIMARY KEY,
    "name" VARCHAR(255) NOT NULL,
    "rating" INT NOT NULL DEFAULT 1200,
    "games_played" INT NOT NULL DEFAULT 0,
    "games_won" INT NOT NULL DEFAULT 0,
    "total_score" INT NOT NULL DEFAULT 0,
    "best_score" INT NOT NULL DEFAULT 0,
    "casual_score" INT NOT NULL DEFAULT 0,
    "last_active" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tries_left" INT NOT NULL DEFAULT 3,
    "last_reset_date" DATE
);
CREATE TABLE IF NOT EXISTS "flags" (
    "id" SERIAL NOT NULL PRIMARY KEY,
    "name" VARCHAR(255) NOT NULL,
    "description" VARCHAR(255),
    "difficulty" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "image" VARCHAR(255) NOT NULL,
    "emoji" VARCHAR(10),
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "total_shown" INT NOT NULL DEFAULT 0,
    "total_correct" INT NOT NULL DEFAULT 0
);
CREATE TABLE IF NOT EXISTS "aerich" (
    "id" SERIAL NOT NULL PRIMARY KEY,
    "version" VARCHAR(255) NOT NULL,
    "app" VARCHAR(100) NOT NULL,
    "content" JSONB NOT NULL
);"""


async def downgrade(db: BaseDBAsyncClient) -> str:
    return """
        """
