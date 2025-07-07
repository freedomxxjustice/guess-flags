from tortoise import fields
from tortoise.models import Model
from tortoise.contrib.pydantic import pydantic_model_creator


class User(Model):
    id = fields.BigIntField(pk=True, unique=True)
    name = fields.CharField(max_length=255)
    rating = fields.IntField(default=1200)  # Starting Elo-like rating
    games_played = fields.IntField(default=0)
    games_won = fields.IntField(default=0)
    total_score = fields.IntField(default=0)  # Sum of all scores
    best_score = fields.IntField(default=0)
    casual_score = fields.IntField(default=0)
    last_active = fields.DatetimeField(auto_now=True)
    created_at = fields.DatetimeField(auto_now_add=True)
    tries_left = fields.IntField(default=3)
    last_reset_date = fields.DateField(null=True)
    casual_game = fields.JSONField(null=True)
    training_score = fields.IntField(default=0)

    class Meta:
        table = "users"

    def __str__(self):
        return f"{self.name} ({self.rating})"


UserSchema = pydantic_model_creator(User)
