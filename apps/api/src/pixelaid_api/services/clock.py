from __future__ import annotations

from datetime import datetime

from pixelaid_shared.gameplay import utc_now as _shared_utc_now


def utc_now() -> datetime:
    return _shared_utc_now()
