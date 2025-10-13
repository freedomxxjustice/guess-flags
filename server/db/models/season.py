from tortoise import fields, models
from tortoise.models import Model
from tortoise.contrib.pydantic import pydantic_model_creator


class Season(Model):
    id = fields.IntField(pk=True)
    title = fields.CharField(max_length=100)
    start_date = fields.DateField()
    end_date = fields.DateField()
    is_active = fields.BooleanField(default=True)  # ← добавляем это

    prizes: fields.ReverseRelation["SeasonPrize"]

    class Meta:
        table = "seasons"


class SeasonPrize(Model):
    id = fields.IntField(pk=True)
    season: fields.ForeignKeyRelation[Season] = fields.ForeignKeyField(
        "models.Season", related_name="prizes", on_delete=fields.CASCADE
    )
    title = fields.CharField(max_length=100)
    link = fields.CharField(max_length=255, null=True)
    place = fields.IntField()  # 1, 2, 3 и т.д.
    quantity = fields.IntField(default=1)  # количество таких призов

    class Meta:
        table = "season_prizes"


# Pydantic модели для сериализации
SeasonSchema = pydantic_model_creator(Season)
SeasonPrizeSchema = pydantic_model_creator(SeasonPrize)
