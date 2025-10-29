import { io } from 'socket.io-client';

// Test Socket.io connection with JWT
const testSocketConnection = () => {
  // Get token (replace with a real token from login)
  const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OTAyMzFiMDc0YmMxMDRlMWE0OWFlYTgiLCJlbWFpbCI6InVzZXIxQHRlc3QuY29tIiwiaWF0IjoxNzYxNzU3MzQzLCJleHAiOjE3NjIzNjIxNDN9.yNI5fEc1YIzV9KgVbbEv0S80MnPUBoUqAx8J0fZEOu8';

  const socket = io('http://localhost:5000', {
    auth: {
      token,
    },
  });

  socket.on('connect', () => {
    console.log('✅ Connected to Socket.io server');
  });

  socket.on('connect_error', (error) => {
    console.log('❌ Connection error:', error.message);
  });

  // Listen for comment events
  socket.on('comment:new', (data) => {
    console.log('📢 New comment:', data);
  });

  socket.on('comment:reply', (data) => {
    console.log('📢 New reply:', data);
  });

  socket.on('comment:update', (data) => {
    console.log('📢 Comment updated:', data);
  });

  socket.on('comment:delete', (data) => {
    console.log('📢 Comment deleted:', data);
  });

  socket.on('comment:reaction', (data) => {
    console.log('📢 Comment reaction:', data);
  });

  socket.on('disconnect', () => {
    console.log('❌ Disconnected from server');
  });

  console.log('🔌 Listening for real-time events...');
  console.log('💡 Create/update/delete comments via API to see events');
};

testSocketConnection();
