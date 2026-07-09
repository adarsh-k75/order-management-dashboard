from typing import List
from fastapi import WebSocket

class ConnectionManager:
    def __init__(self):
        # Keep track of active WebSocket connections
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        """Accept connection and register with active list."""
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        """Remove connection from active list."""
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def broadcast(self, message: dict):
        """Broadcast message to all connected clients. Cleans up stale connections if writing fails."""
        failed_connections = []
        for connection in self.active_connections:
            try:
                await connection.send_json(message)
            except Exception:
                failed_connections.append(connection)

        # Cleanup connections that raised exceptions (e.g. client closed page tab)
        for connection in failed_connections:
            self.disconnect(connection)

manager = ConnectionManager()
