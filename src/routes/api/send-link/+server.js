import { json } from '@sveltejs/kit';
import { roomConnections } from '$lib/roomConnections.js';

export async function POST({ request }) {
  try {
    const { roomId, url } = await request.json();

    if (!roomId || !url) {
      return json({ error: 'Room ID and URL are required' }, { status: 400 });
    }

    const connections = roomConnections.get(roomId) || [];

    const message = JSON.stringify({
      type: 'redirect',
      url: url,
      timestamp: Date.now(),
    });

    connections.forEach((connection) => {
      try {
        connection.write(`data: ${message}\n\n`);
      } catch (error) {
        console.error('Error sending to connection:', error);
      }
    });

    return json({
      success: true,
      message: `Link sent to ${connections.length} students in room ${roomId}`,
    });
  } catch (error) {
    console.error('Error in send-link endpoint:', error);
    return json({ error: 'Internal server error' }, { status: 500 });
  }
}
