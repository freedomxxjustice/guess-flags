from tortoise import fields
from tortoise.models import Model
from tortoise.contrib.pydantic import pydantic_model_creator


class CasualMatch(Model):
    id = fields.UUIDField(pk=True)
    user = fields.ForeignKeyField("models.User", related_name="casual_matches")
    created_at = fields.DatetimeField(auto_now_add=True)
    completed_at = fields.DatetimeField(null=True)
    score = fields.IntField(default=0)
    num_questions = fields.IntField()
    current_question_idx = fields.IntField(default=0)
    current_question_started_at = fields.DatetimeField(null=True)
    questions = fields.JSONField()


class CasualAnswer(Model):
    id = fields.UUIDField(pk=True)
    match = fields.ForeignKeyField("models.CasualMatch", related_name="answers")
    question_idx = fields.IntField()
    flag_id = fields.IntField()
    user_answer = fields.TextField()
    is_correct = fields.BooleanField()
    answered_at = fields.DatetimeField(auto_now_add=True)


CasualMatchSchema = pydantic_model_creator(CasualMatch)
CasualAnswerSchema = pydantic_model_creator(CasualAnswer)
