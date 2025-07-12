from tortoise import fields
from tortoise.models import Model
from tortoise.contrib.pydantic import pydantic_model_creator


class CasualEverydayTournamentParticipant(Model):
    id = fields.IntField(pk=True)
    tournament = fields.ForeignKeyField(
        "models.CasualEverydayTournament",
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


class CasualEverydayTournament(Model):
    id = fields.IntField(pk=True)
    name = fields.CharField(max_length=255)
    created_at = fields.DatetimeField(auto_now_add=True)
    finished_at = fields.DatetimeField(null=True)
    prizes = fields.JSONField(null=True)
    participation_cost = fields.IntField(default=0)

    participants: fields.ReverseRelation["CasualEverydayTournamentParticipant"]


CasualEverydayTournamentSchema = pydantic_model_creator(CasualEverydayTournament)

CasualEverydayTournamentParticipantSchema = pydantic_model_creator(
    CasualEverydayTournamentParticipant
)
