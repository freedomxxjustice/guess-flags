import uuid
from tortoise import fields
from tortoise.models import Model
from tortoise.contrib.pydantic import pydantic_model_creator


class Match(Model):
    id = fields.UUIDField(pk=True, default=uuid.uuid4)
    player_1 = fields.ForeignKeyField("models.User", related_name="matches_as_p1")
    player_2 = fields.ForeignKeyField("models.User", related_name="matches_as_p2", null=True)
    flags = fields.JSONField()  # Should be a list of flag IDs or objects
    is_finished = fields.BooleanField(default=False)
    created_at = fields.DatetimeField(auto_now_add=True)

    class Meta:
        table = "matches"

    def __str__(self):
        return f"Match({self.id})"
MatchSchema = pydantic_model_creator(Match)
