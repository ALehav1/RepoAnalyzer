from fastapi import Request
from sse_starlette.sse import EventSourceResponse
from typing import AsyncGenerator
import json
import asyncio
from datetime import datetime

class AnalysisStream:
    def __init__(self):
        self._subscribers = set()
        self._lock = asyncio.Lock()

    async def subscribe(self, request: Request) -> EventSourceResponse:
        async def event_generator() -> AsyncGenerator:
            subscriber = asyncio.Queue()
            
            async with self._lock:
                self._subscribers.add(subscriber)
            
            try:
                while True:
                    if await request.is_disconnected():
                        break

                    try:
                        data = await asyncio.wait_for(subscriber.get(), timeout=1.0)
                        yield {
                            "event": "message",
                            "data": json.dumps(data),
                            "id": datetime.now().isoformat()
                        }
                    except asyncio.TimeoutError:
                        yield {
                            "event": "ping",
                            "data": "",
                            "id": datetime.now().isoformat()
                        }
            finally:
                async with self._lock:
                    self._subscribers.remove(subscriber)

        return EventSourceResponse(event_generator())

    async def publish(self, data: dict):
        async with self._lock:
            for subscriber in self._subscribers:
                await subscriber.put(data)

analysis_stream = AnalysisStream()
