# app/core/stream_manager.py

class StreamManager:
    def __init__(self):
        self.active = {}

    def start(self, session_id: str):
        self.active[session_id] = True

    def stop(self, session_id: str):
        self.active[session_id] = False

    def is_active(self, session_id: str) -> bool:
        return self.active.get(session_id, False)


stream_manager = StreamManager()
