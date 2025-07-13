from aiogram import Router
from . import common, payment, admin


def setup_routers() -> Router:
    router = Router()

    router.include_router(common.router)
    router.include_router(payment.router)
    router.include_router(admin.router)
    return router
