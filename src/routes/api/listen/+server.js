import { roomConnections } from '$lib/roomConnections.js';

export async function GET({ url }) {
  const roomId = url.searchParams.get('roomid');

  if (!roomId) {
    return new Response('Room ID is required', { status: 400 });
  }

  const stream = new ReadableStream({
    start(controller) {
      const headers = {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Cache-Control',
      };

      const connection = {
        write: (data) => {
          try {
            controller.enqueue(new TextEncoder().encode(data));
          } catch (error) {
            console.error('Error writing to stream:', error);
          }
        },
        close: () => {
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

      const keepAlive = setInterval(() => {
        try {
          connection.write(
            `data: ${JSON.stringify({
              type: 'ping',
              timestamp: Date.now(),
            })}\n\n`,
          );
        } catch (error) {
          clearInterval(keepAlive);
        }
      }, 30000);

      return () => {
        clearInterval(keepAlive);
        const connections = roomConnections.get(roomId) || [];
        const index = connections.indexOf(connection);
        if (index > -1) {
          connections.splice(index, 1);
        }
        if (connections.length === 0) {
          roomConnections.delete(roomId);
        }
      };
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
