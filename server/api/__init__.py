from fastapi import APIRouter
from . import common, create_training_game, training_results, users, payment


def setup_routers() -> APIRouter:
    router = APIRouter()

    router.include_router(common.router)
    router.include_router(users.router)
    router.include_router(create_training_game.router)
    router.include_router(training_results.router)
    router.include_router(payment.router)
    return router
