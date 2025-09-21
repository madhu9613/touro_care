let socket: WebSocket | null = null;

export const connectWS = (url: string, onMessage: (data: any) => void) => {
  socket = new WebSocket(url);

  socket.onopen = () => {
    console.log('WS connected');
  };

  socket.onmessage = (event) => {
    try {
      const { topic, payload } = JSON.parse(event.data);
      onMessage({ topic, payload });
    } catch (err) {
      console.error('Invalid WS message:', event.data);
    }
  };

  socket.onclose = () => console.log('WS disconnected');
  socket.onerror = (err) => console.error('WS error:', err);
};

export const disconnectWS = () => {
  if (socket) socket.close();
};
