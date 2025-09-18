from tortoise import fields, models
from tortoise.models import Model

class Achievement(Model):
    id = fields.IntField(pk=True)
    title = fields.CharField(max_length=100)
    description = fields.TextField()
    category = fields.CharField(max_length=50, null=True)  
    target = fields.IntField() 
    image = fields.CharField(max_length=255, null=True) 

    class Meta:
        table = "achievements"
