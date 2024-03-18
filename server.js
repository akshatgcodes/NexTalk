'use strict';

const path = require('path');
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));

// ---------------------------------------------------------------------------
// In-memory state. Nothing here touches disk or a database -- it all lives
// for the lifetime of the process, per the "no DB, no persistence" spec.
//
// rooms: Map<roomName, {
//   users: Map<socketId, { username: string, isGhost: boolean }>,
//   messages: Map<messageId, {
//     id, username, text, timestamp,
//     reactions: { '👍': Set<socketId>, '❤️': Set<socketId>, '😂': Set<socketId> }
//   }>
// }>
// ---------------------------------------------------------------------------
const rooms = new Map();

const ALLOWED_REACTIONS = ['👍', '❤️', '😂'];
const MAX_HISTORY_PER_ROOM = 200;

function getOrCreateRoom(roomName) {
  if (!rooms.has(roomName)) {
    rooms.set(roomName, { users: new Map(), messages: new Map() });
  }
  return rooms.get(roomName);
}

// The list broadcast to clients only ever contains non-ghost users. This is
// the server-side enforcement point for ghost mode: ghosts are tracked in
// room.users like everyone else (so counts/lookups work), but this function
// is the single place presence data crosses the wire, and it always filters
// them out.
function visiblePresenceList(room) {
  return Array.from(room.users.values())
    .filter((u) => !u.isGhost)
    .map((u) => u.username);
}

function broadcastPresence(roomName) {
  const room = rooms.get(roomName);
  if (!room) return;
  io.to(roomName).emit('presence-update', {
    room: roomName,
    users: visiblePresenceList(room),
  });
}

function serializeMessage(msg) {
  return {
    id: msg.id,
    username: msg.username,
    text: msg.text,
    timestamp: msg.timestamp,
    system: !!msg.system,
    reactions: reactionCounts(msg),
  };
}

function reactionCounts(msg) {
  const counts = {};
  for (const emoji of ALLOWED_REACTIONS) {
    counts[emoji] = msg.reactions[emoji].size;
  }
  return counts;
}

function cleanupEmptyRoom(roomName) {
  const room = rooms.get(roomName);
  if (room && room.users.size === 0) {
    rooms.delete(roomName);
  }
}

io.on('connection', (socket) => {
  socket.data.username = null;
  socket.data.room = null;
  socket.data.isGhost = false;

  socket.on('join', ({ username, room, ghost }) => {
    username = String(username || '').trim().slice(0, 30);
    room = String(room || '').trim().slice(0, 40);
    const isGhost = !!ghost;

    if (!username || !room) {
      socket.emit('join-error', { message: 'Username and room are required.' });
      return;
    }

    socket.data.username = username;
    socket.data.room = room;
    socket.data.isGhost = isGhost;

    socket.join(room);

    const roomState = getOrCreateRoom(room);
    roomState.users.set(socket.id, { username, isGhost });

    // Send the joining client its own state + recent history (in-memory
    // replay only, not persisted anywhere).
    socket.emit('joined', {
      room,
      username,
      isGhost,
      users: visiblePresenceList(roomState),
      history: Array.from(roomState.messages.values()).map(serializeMessage),
    });

    if (!isGhost) {
      const sysMsg = pushSystemMessage(roomState, `${username} joined the room.`);
      io.to(room).emit('chat-message', serializeMessage(sysMsg));
    }

    // Presence updates go to the whole room (ghosts included -- a ghost can
    // still see who else is around) but the payload itself never contains
    // ghost usernames, per visiblePresenceList().
    broadcastPresence(room);
  });

  socket.on('chat-message', ({ text }) => {
    const { room, username } = socket.data;
    if (!room || !username) return;
    text = String(text || '').trim().slice(0, 1000);
    if (!text) return;

    const roomState = getOrCreateRoom(room);
    const msg = {
      id: `${socket.id}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      username,
      text,
      timestamp: Date.now(),
      system: false,
      reactions: {
        '👍': new Set(),
        '❤️': new Set(),
        '😂': new Set(),
      },
    };
    roomState.messages.set(msg.id, msg);
    trimHistory(roomState);

    // Every socket in the room receives every message, ghosts included --
    // ghost mode only hides presence, it never hides content.
    io.to(room).emit('chat-message', serializeMessage(msg));
  });

  socket.on('react', ({ messageId, emoji }) => {
    const { room } = socket.data;
    if (!room || !ALLOWED_REACTIONS.includes(emoji)) return;

    const roomState = rooms.get(room);
    if (!roomState) return;
    const msg = roomState.messages.get(messageId);
    if (!msg) return;

    const reactedSet = msg.reactions[emoji];
    // Toggle: clicking again removes your own reaction.
    if (reactedSet.has(socket.id)) {
      reactedSet.delete(socket.id);
    } else {
      reactedSet.add(socket.id);
    }

    io.to(room).emit('reaction-update', {
      messageId,
      reactions: reactionCounts(msg),
    });
  });

  // Mid-session ghost exit: the client sends this, the server flips the
  // flag it actually trusts (socket.data.isGhost / room.users entry), and
  // only after that does the user appear in the broadcast presence list.
  socket.on('exit-ghost', () => {
    const { room, username } = socket.data;
    if (!room || !username || !socket.data.isGhost) return;

    socket.data.isGhost = false;
    const roomState = rooms.get(room);
    if (roomState && roomState.users.has(socket.id)) {
      roomState.users.get(socket.id).isGhost = false;
    }

    socket.emit('ghost-exited');

    if (roomState) {
      const sysMsg = pushSystemMessage(roomState, `${username} is now visible.`);
      io.to(room).emit('chat-message', serializeMessage(sysMsg));
    }

    broadcastPresence(room);
  });

  socket.on('disconnect', () => {
    const { room, username, isGhost } = socket.data;
    if (!room) return;

    const roomState = rooms.get(room);
    if (roomState) {
      roomState.users.delete(socket.id);

      if (!isGhost && username) {
        const sysMsg = pushSystemMessage(roomState, `${username} left the room.`);
        io.to(room).emit('chat-message', serializeMessage(sysMsg));
      }

      broadcastPresence(room);
      cleanupEmptyRoom(room);
    }
  });
});

function pushSystemMessage(roomState, text) {
  const msg = {
    id: `system-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    username: 'System',
    text,
    timestamp: Date.now(),
    system: true,
    reactions: {
      '👍': new Set(),
      '❤️': new Set(),
      '😂': new Set(),
    },
  };
  roomState.messages.set(msg.id, msg);
  trimHistory(roomState);
  return msg;
}

function trimHistory(roomState) {
  if (roomState.messages.size <= MAX_HISTORY_PER_ROOM) return;
  const oldestKey = roomState.messages.keys().next().value;
  roomState.messages.delete(oldestKey);
}

server.listen(PORT, () => {
  console.log(`NexTalk server listening on http://localhost:${PORT}`);
});

module.exports = { app, server, io };

// Built incrementally - see git history for the development progression.
