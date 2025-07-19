from tortoise import fields
from tortoise.models import Model
from tortoise.contrib.pydantic import pydantic_model_creator

class Tournament(Model):
    id = fields.IntField(pk=True)
    name = fields.CharField(max_length=255)
    type = fields.CharField(
        max_length=50, default="casual_daily"
    )
    created_at = fields.DatetimeField(auto_now_add=True)
    started_at = fields.DatetimeField(null=True)
    finished_at = fields.DatetimeField(null=True)
    prizes = fields.JSONField(null=True)
    participation_cost = fields.IntField(default=0)
    min_participants = fields.IntField(default=0)

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


TournamentSchema = pydantic_model_creator(Tournament)
TournamentParticipantSchema = pydantic_model_creator(TournamentParticipant)
