// frontend/utils/wsClient.ts
let ws: WebSocket | null = null;

export function initWebSocket(onMessage: (topic: string, payload: any) => void) {
  ws = new WebSocket('ws://localhost:5001'); // your WS server URL

  ws.onopen = () => console.log('Connected to WebSocket server');

  ws.onmessage = (event) => {
    try {
      const { topic, payload } = JSON.parse(event.data);
      onMessage(topic, payload);
    } catch (err) {
      console.error('WS parse error', err);
    }
  };

  ws.onclose = () => {
    console.log('Disconnected from WebSocket. Reconnecting in 3s...');
    setTimeout(() => initWebSocket(onMessage), 3000);
  };

  ws.onerror = (err) => console.error('WebSocket error', err);
}
