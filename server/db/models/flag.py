from tortoise import fields
from tortoise.models import Model
from tortoise.contrib.pydantic import pydantic_model_creator


class Flag(Model):
    id = fields.IntField(pk=True)
    name = fields.CharField(255)
    description = fields.CharField(255)
    difficulty = fields.DecimalField(10, 2)
    image = fields.CharField(255)
    emoji = fields.CharField(10)
    created_at = fields.DatetimeField(auto_now_add=True)

    class Meta:
        table = "flags"


FlagSchema = pydantic_model_creator(Flag)
