(() => {
  const REACTIONS = ['👍', '❤️', '😂'];

  const joinScreen = document.getElementById('join-screen');
  const chatScreen = document.getElementById('chat-screen');
  const joinForm = document.getElementById('join-form');
  const usernameInput = document.getElementById('username');
  const roomInput = document.getElementById('room');
  const ghostToggle = document.getElementById('ghost-toggle');
  const joinError = document.getElementById('join-error');

  const roomNameEl = document.getElementById('room-name');
  const myStatusEl = document.getElementById('my-status');
  const exitGhostBtn = document.getElementById('exit-ghost-btn');
  const userListEl = document.getElementById('user-list');
  const onlineCountEl = document.getElementById('online-count');
  const leaveBtn = document.getElementById('leave-btn');

  const messagesEl = document.getElementById('messages');
  const messageForm = document.getElementById('message-form');
  const messageInput = document.getElementById('message-input');

  let socket = null;
  let myUsername = null;
  let isGhost = false;

  // Pre-fill ghost checkbox from ?ghost=true in the URL, per spec.
  const params = new URLSearchParams(window.location.search);
  if (params.get('ghost') === 'true') {
    ghostToggle.checked = true;
  }
  const prefillRoom = params.get('room');
  if (prefillRoom) roomInput.value = prefillRoom;

  joinForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const username = usernameInput.value.trim();
    const room = roomInput.value.trim();
    if (!username || !room) return;

    joinError.hidden = true;
    connectAndJoin(username, room, ghostToggle.checked);
  });

  function connectAndJoin(username, room, ghost) {
    socket = io();

    socket.on('connect', () => {
      socket.emit('join', { username, room, ghost });
    });

    socket.on('join-error', ({ message }) => {
      joinError.textContent = message;
      joinError.hidden = false;
    });

    socket.on('joined', (payload) => {
      myUsername = payload.username;
      isGhost = payload.isGhost;
      showChatScreen(payload);
    });

    socket.on('presence-update', ({ users }) => {
      renderUserList(users);
    });

    socket.on('chat-message', (msg) => {
      appendMessage(msg);
    });

    socket.on('reaction-update', ({ messageId, reactions }) => {
      updateReactionUI(messageId, reactions);
    });

    socket.on('ghost-exited', () => {
      isGhost = false;
      exitGhostBtn.hidden = true;
      myStatusEl.textContent = 'Online';
      myStatusEl.classList.remove('ghost');
    });

    socket.on('disconnect', () => {
      // no-op: user explicitly leaves via leaveBtn, or connection dropped.
    });
  }

  function showChatScreen(payload) {
    joinScreen.hidden = true;
    chatScreen.hidden = false;
    roomNameEl.textContent = `#${payload.room}`;
    renderUserList(payload.users);
    messagesEl.innerHTML = '';
    (payload.history || []).forEach(appendMessage);

    if (payload.isGhost) {
      myStatusEl.textContent = 'Ghost mode';
      myStatusEl.classList.add('ghost');
      exitGhostBtn.hidden = false;
    } else {
      myStatusEl.textContent = 'Online';
      myStatusEl.classList.remove('ghost');
      exitGhostBtn.hidden = true;
    }
  }

  function renderUserList(users) {
    userListEl.innerHTML = '';
    users.forEach((u) => {
      const li = document.createElement('li');
      li.textContent = u;
      userListEl.appendChild(li);
    });
    onlineCountEl.textContent = `(${users.length})`;
  }

  function appendMessage(msg) {
    const row = document.createElement('div');
    row.dataset.messageId = msg.id;

    if (msg.system) {
      row.className = 'msg-row system';
      const bubble = document.createElement('div');
      bubble.className = 'msg-bubble';
      bubble.textContent = msg.text;
      row.appendChild(bubble);
      messagesEl.appendChild(row);
      scrollToBottom();
      return;
    }

    const mine = msg.username === myUsername;
    row.className = `msg-row ${mine ? 'mine' : 'theirs'}`;

    const meta = document.createElement('div');
    meta.className = 'msg-meta';
    const time = new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    meta.textContent = `${mine ? 'You' : msg.username} · ${time}`;

    const bubble = document.createElement('div');
    bubble.className = 'msg-bubble';
    bubble.textContent = msg.text;

    const reactionsEl = buildReactionBar(msg.id, msg.reactions);

    row.appendChild(meta);
    row.appendChild(bubble);
    row.appendChild(reactionsEl);
    messagesEl.appendChild(row);
    scrollToBottom();
  }

  function buildReactionBar(messageId, reactions) {
    const bar = document.createElement('div');
    bar.className = 'reactions';
    REACTIONS.forEach((emoji) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'reaction-btn';
      btn.dataset.emoji = emoji;
      btn.innerHTML = `<span>${emoji}</span><span class="count">${(reactions && reactions[emoji]) || 0}</span>`;
      btn.addEventListener('click', () => {
        socket.emit('react', { messageId, emoji });
      });
      bar.appendChild(btn);
    });
    return bar;
  }

  function updateReactionUI(messageId, reactions) {
    const row = messagesEl.querySelector(`[data-message-id="${cssEscape(messageId)}"]`);
    if (!row) return;
    const buttons = row.querySelectorAll('.reaction-btn');
    buttons.forEach((btn) => {
      const emoji = btn.dataset.emoji;
      const count = reactions[emoji] || 0;
      btn.querySelector('.count').textContent = count;
    });
  }

  function cssEscape(id) {
    return id.replace(/["\\]/g, '\\$&');
  }

  function scrollToBottom() {
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  messageForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = messageInput.value.trim();
    if (!text || !socket) return;
    socket.emit('chat-message', { text });
    messageInput.value = '';
  });

  exitGhostBtn.addEventListener('click', () => {
    if (socket) socket.emit('exit-ghost');
  });

  leaveBtn.addEventListener('click', () => {
    window.location.reload();
  });
})();
