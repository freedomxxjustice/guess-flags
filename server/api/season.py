from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse
from db import Season

router = APIRouter(prefix="/api/seasons")


@router.get("/current")
async def get_current_season() -> JSONResponse:
    """
    Возвращает текущий активный сезон с призами.
    """
    now = datetime.now(timezone.utc)

    
    season = (
        await Season.filter(start_date__lte=now, end_date__gte=now, is_active=True)
        .prefetch_related("prizes")
        .first()
    )

    
    if not season:
        season = (
            await Season.filter(start_date__gt=now, is_active=True)
            .order_by("start_date")
            .prefetch_related("prizes")
            .first()
        )

    if not season:
        raise HTTPException(status_code=404, detail="No active or upcoming season")

    prizes_list = [
        {
            "id": prize.id,
            "title": prize.title,
            "link": prize.link,
            "place": prize.place,
            "quantity": prize.quantity,
        }
        for prize in sorted(season.prizes, key=lambda p: p.place)
    ]

    return JSONResponse(
        {
            "id": season.id,
            "title": season.title,
            "start_date": season.start_date.isoformat(),
            "end_date": season.end_date.isoformat(),
            "prizes": prizes_list,
        }
    )
