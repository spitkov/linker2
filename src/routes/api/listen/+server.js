import { roomConnections } from '$lib/roomConnections.js';

export async function GET({ url, request }) {
  const roomId = url.searchParams.get('roomid');

  if (!roomId) {
    return new Response('Room ID is required', { status: 400 });
  }

  let keepAlive;
  let closed = false;

  const stream = new ReadableStream({
    start(controller) {
      const connection = {
        write: (data) => {
          if (closed) return;
          try {
            controller.enqueue(new TextEncoder().encode(data));
          } catch (error) {
            closed = true;
            clearInterval(keepAlive);
            console.error('Error writing to stream:', error);
          }
        },
        close: () => {
          if (closed) return;
          closed = true;
          clearInterval(keepAlive);
          try {
            controller.close();
          } catch (error) {
            console.error('Error closing stream:', error);
          }
        },
      };

      if (!roomConnections.has(roomId)) {
        roomConnections.set(roomId, []);
      }
      roomConnections.get(roomId).push(connection);

      connection.write(
        `data: ${JSON.stringify({
          type: 'connected',
          roomId: roomId,
          timestamp: Date.now(),
        })}\n\n`,
      );

      keepAlive = setInterval(() => {
        connection.write(
          `data: ${JSON.stringify({
            type: 'ping',
            timestamp: Date.now(),
          })}\n\n`,
        );
      }, 30000);

      const cleanup = () => {
        if (closed) return;
        closed = true;
        clearInterval(keepAlive);
        const connections = roomConnections.get(roomId) || [];
        const index = connections.indexOf(connection);
        if (index > -1) connections.splice(index, 1);
        if (connections.length === 0) roomConnections.delete(roomId);
        try {
          controller.close();
        } catch {}
      };

      try {
        request?.signal?.addEventListener('abort', cleanup, { once: true });
      } catch {}

      return cleanup;
    },
    cancel() {
      closed = true;
      clearInterval(keepAlive);

      const connections = roomConnections.get(roomId) || [];

      for (let i = connections.length - 1; i >= 0; i--) {
        const c = connections[i];
        if (!c || typeof c.write !== 'function') connections.splice(i, 1);
      }
      if (connections.length === 0) roomConnections.delete(roomId);
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control',
    },
  });
}
