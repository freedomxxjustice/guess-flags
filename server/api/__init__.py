from fastapi import APIRouter
from . import (
    common,
    training_game,
    training_results,
    users,
    payment,
    casual_game,
    casual_tournament,
)


def setup_routers() -> APIRouter:
    router = APIRouter()

    router.include_router(common.router)
    router.include_router(users.router)
    router.include_router(training_game.router)
    router.include_router(training_results.router)
    router.include_router(casual_game.router)
    router.include_router(payment.router)
    router.include_router(casual_tournament.router)
    return router
