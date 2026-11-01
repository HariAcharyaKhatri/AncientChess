let wsConnected = false;
let autoReconnect = true;
let reconnectTimer = null;
let pingInterval = null;

function initWebSocket() {
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const host = window.location.host;
  // Fallback to specific port if running locally
  const wsUrl = (host.includes('localhost') || host.includes('127.0.0.1'))
    ? protocol + '//' + host.split(':')[0] + ':8080'
    : protocol + '//' + host;

  if (wsClient) {
    autoReconnect = false;
    wsClient.close();
  }

  try {
    wsClient = new WebSocket(wsUrl);
    
    wsClient.onopen = () => {
      wsConnected = true;
      setServerStatus('Connected', true);
      updateConnectionIndicator();
      
      // Send auth token if we have one
      if (authToken) {
        wsClient.send(JSON.stringify({ type: 'auth', token: authToken }));
      }
      
      if (pingInterval) clearInterval(pingInterval);
      pingInterval = setInterval(() => {
        if (wsConnected && wsClient.readyState === WebSocket.OPEN) {
          wsClient.send(JSON.stringify({ type: 'ping' }));
        }
      }, 30000);
    };

    wsClient.onmessage = (e) => {
      try {
        const msg = JSON.parse(e.data);
        handleServerMessage(msg);
      } catch (err) {
        console.error('WS message error:', err);
      }
    };

    wsClient.onclose = () => {
      wsConnected = false;
      setServerStatus('Disconnected', false);
      updateConnectionIndicator();
      if (pingInterval) clearInterval(pingInterval);
      
      if (autoReconnect) {
        if (reconnectTimer) clearTimeout(reconnectTimer);
        reconnectTimer = setTimeout(initWebSocket, 3000);
      }
    };

    wsClient.onerror = () => {
      wsConnected = false;
      setServerStatus('Error connecting', false);
      updateConnectionIndicator();
    };
  } catch (err) {
    setServerStatus('Connection failed', false);
    updateConnectionIndicator();
  }
}

function setServerStatus(text, isOnline) {
  const el = document.getElementById('server-status-text');
  if (el) {
    el.textContent = text;
    el.style.color = isOnline ? 'var(--accent)' : 'var(--danger)';
  }
}

function updateConnectionIndicator() {
  const ind = document.getElementById('connection-indicator');
  if (ind) {
    ind.className = 'connection-indicator ' + (wsConnected ? 'connected' : 'disconnected');
    ind.title = wsConnected ? 'Connected to server' : 'Disconnected from server';
  }
  
  if (gameState && gameState.isMultiplayer && !wsConnected && !gameState.gameOver) {
    showDisconnectBanner();
  } else {
    hideDisconnectBanner();
  }
}

function handleServerMessage(msg) {
  if (msg.type === 'auth_success') {
    // Optionally handle successful auth
  } else if (msg.type === 'match_start') {
    handleMatchStart(msg);
  } else if (msg.type === 'move_made') {
    handleServerMoveMade(msg);
  } else if (msg.type === 'clock_sync') {
    handleClockSync(msg);
  } else if (msg.type === 'game_over') {
    handleGameOver(msg);
  } else if (msg.type === 'chat') {
    receiveChatMessage(msg.sender, msg.text);
  } else if (msg.type === 'draw_offer') {
    showDrawOfferBanner();
  } else if (msg.type === 'error') {
    handleServerError(msg);
  }
}
