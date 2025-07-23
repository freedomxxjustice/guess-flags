from tortoise import fields
from tortoise.models import Model
from tortoise.contrib.pydantic import pydantic_model_creator


class Match(Model):
    id = fields.UUIDField(pk=True)
    user = fields.ForeignKeyField("models.User", related_name="matches")
    created_at = fields.DatetimeField(auto_now_add=True)
    completed_at = fields.DatetimeField(null=True)

    score = fields.IntField(default=0)
    base_score = fields.IntField(default=0)
    difficulty_multiplier = fields.FloatField(default=1.0)

    num_questions = fields.IntField()
    current_question_idx = fields.IntField(default=0)
    current_question_started_at = fields.DatetimeField(null=True)
    questions = fields.JSONField()

    gamemode = fields.CharField(max_length=10, null=True)
    category = fields.CharField(max_length=32, null=True)
    tags = fields.JSONField(default=list)

    match_type = fields.CharField(
        max_length=10, default="casual"
    )  # 'casual' / 'tournament'
    tournament = fields.ForeignKeyField(
        "models.Tournament", related_name="matches", null=True
    )
    participant = fields.ForeignKeyField(
        "models.TournamentParticipant", related_name="matches", null=True
    )


class MatchAnswer(Model):
    id = fields.UUIDField(pk=True)
    match = fields.ForeignKeyField("models.Match", related_name="answers")
    question_idx = fields.IntField()
    flag_id = fields.IntField()
    user_answer = fields.TextField()
    is_correct = fields.BooleanField()
    answered_at = fields.DatetimeField(auto_now_add=True)


MatchSchema = pydantic_model_creator(Match)
MatchAnswerSchema = pydantic_model_creator(MatchAnswer)
