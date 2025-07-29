from tortoise import fields
from tortoise.models import Model
from tortoise.contrib.pydantic import pydantic_model_creator


class Tournament(Model):
    id = fields.IntField(pk=True)
    name = fields.CharField(max_length=255)
    type = fields.CharField(max_length=50, default="casual_daily")
    created_at = fields.DatetimeField(auto_now_add=True)
    started_at = fields.DatetimeField(null=True)
    will_finish_at = fields.DatetimeField(null=True)
    finished_at = fields.DatetimeField(null=True)
    prizes = fields.JSONField(null=True)
    participation_cost = fields.IntField(default=0)
    min_participants = fields.IntField(default=0)
    num_questions = fields.IntField(default=10)
    gamemode = fields.CharField(max_length=10, default="choose")
    category = fields.CharField(max_length=32, null=True)
    tags = fields.JSONField(default=list)
    difficulty_multiplier = fields.FloatField(default=1.0)
    base_score = fields.IntField(default=0)
    tries = fields.IntField(default=1)

    participants: fields.ReverseRelation["TournamentParticipant"]


class TournamentParticipant(Model):
    id = fields.IntField(pk=True)
    tournament = fields.ForeignKeyField(
        "models.Tournament",
        related_name="participants",
        on_delete=fields.CASCADE,
    )
    user = fields.ForeignKeyField(
        "models.User",
        related_name="tournament_participations",
        on_delete=fields.CASCADE,
    )
    score = fields.IntField(default=0)
    place = fields.IntField(null=True)
    prize = fields.JSONField(null=True)
    tries_left = fields.IntField()


class Prize(Model):
    id = fields.IntField(pk=True)
    type = fields.CharField(max_length=50)  # e.g. 'telegram_gift', 'coin', 'link'
    title = fields.CharField(max_length=255)  # e.g. 'Swag Bag', '100 Coins'
    description = fields.TextField(null=True)
    media_url = fields.TextField(null=True)  # tgs/gif/image
    link = fields.TextField(null=True)  # e.g. https://t.me/nft/SwagBag-2
    metadata = fields.JSONField(null=True)  # anything else like token IDs


class TournamentPrize(Model):
    id = fields.IntField(pk=True)
    tournament = fields.ForeignKeyField("models.Tournament", related_name="prize_slots")
    prize = fields.ForeignKeyField("models.Prize", related_name="prize_awards")
    place = fields.IntField()  # 1, 2, 3...


TournamentPrizeSchema = pydantic_model_creator(TournamentPrize)
PrizeSchema = pydantic_model_creator(Prize)
TournamentSchema = pydantic_model_creator(Tournament)
TournamentParticipantSchema = pydantic_model_creator(TournamentParticipant)
