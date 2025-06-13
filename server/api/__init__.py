from fastapi import APIRouter
from . import common, users, create_game, results


def setup_routers() -> APIRouter:
    router = APIRouter()

    router.include_router(common.router)
    router.include_router(users.router)
    router.include_router(create_game.router)
    router.include_router(results.router)
    return router
