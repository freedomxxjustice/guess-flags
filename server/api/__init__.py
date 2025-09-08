from fastapi import APIRouter
from . import (
    common,
    match,
    tournament,
    training_game,
    training_results,
    users,
    payment,
    season,
)


def setup_routers() -> APIRouter:
    router = APIRouter()

    router.include_router(common.router)
    router.include_router(users.router)
    router.include_router(training_game.router)
    router.include_router(training_results.router)
    router.include_router(match.router)
    router.include_router(payment.router)
    router.include_router(tournament.router)
    router.include_router(season.router)
    return router
