from tortoise import BaseDBAsyncClient


async def upgrade(db: BaseDBAsyncClient) -> str:
    return """
        CREATE TABLE IF NOT EXISTS "users" (
    "id" BIGSERIAL NOT NULL PRIMARY KEY,
    "name" VARCHAR(255) NOT NULL,
    "rating" INT NOT NULL DEFAULT 1200,
    "rating_games_played" INT NOT NULL DEFAULT 0,
    "rating_games_won" INT NOT NULL DEFAULT 0,
    "total_score" INT NOT NULL DEFAULT 0,
    "best_score" INT NOT NULL DEFAULT 0,
    "casual_score" INT NOT NULL DEFAULT 0,
    "last_active" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tries_left" INT NOT NULL DEFAULT 3,
    "last_reset_date" DATE,
    "casual_game" JSONB,
    "training_score" INT NOT NULL DEFAULT 0,
    "casual_games_played" INT NOT NULL DEFAULT 0,
    "today_casual_score" INT NOT NULL DEFAULT 0
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
    "total_correct" INT NOT NULL DEFAULT 0,
    "category" VARCHAR(128) NOT NULL
);
CREATE TABLE IF NOT EXISTS "casualmatch" (
    "id" UUID NOT NULL PRIMARY KEY,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMPTZ,
    "score" INT NOT NULL DEFAULT 0,
    "num_questions" INT NOT NULL,
    "current_question_idx" INT NOT NULL DEFAULT 0,
    "current_question_started_at" TIMESTAMPTZ,
    "questions" JSONB NOT NULL,
    "user_id" BIGINT NOT NULL REFERENCES "users" ("id") ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS "casualanswer" (
    "id" UUID NOT NULL PRIMARY KEY,
    "question_idx" INT NOT NULL,
    "flag_id" INT NOT NULL,
    "user_answer" TEXT NOT NULL,
    "is_correct" BOOL NOT NULL,
    "answered_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "match_id" UUID NOT NULL REFERENCES "casualmatch" ("id") ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS "casualeverydaytournament" (
    "id" SERIAL NOT NULL PRIMARY KEY,
    "name" VARCHAR(255) NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finished_at" TIMESTAMPTZ,
    "prizes" JSONB,
    "participation_cost" INT NOT NULL DEFAULT 0
);
CREATE TABLE IF NOT EXISTS "casualeverydaytournamentparticipant" (
    "id" SERIAL NOT NULL PRIMARY KEY,
    "score" INT NOT NULL DEFAULT 0,
    "place" INT,
    "prize" JSONB,
    "tournament_id" INT NOT NULL REFERENCES "casualeverydaytournament" ("id") ON DELETE CASCADE,
    "user_id" BIGINT NOT NULL REFERENCES "users" ("id") ON DELETE CASCADE
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
