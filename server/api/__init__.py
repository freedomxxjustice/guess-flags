from fastapi import APIRouter
from . import (
    casual,
    common,
    tournament,
    training_game,
    training_results,
    users,
    payment,
)


def setup_routers() -> APIRouter:
    router = APIRouter()

    router.include_router(common.router)
    router.include_router(users.router)
    router.include_router(training_game.router)
    router.include_router(training_results.router)
    router.include_router(casual.router)
    router.include_router(payment.router)
    router.include_router(tournament.router)
    return router
