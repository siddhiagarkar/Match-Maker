const mongoose = require('mongoose');
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const passport = require('passport');
const http = require('http'); // <-- Required for socket.io

dotenv.config();

// Create Express app
const app = express();

app.use(express.json());
app.use(cors());
app.use(passport.initialize());

// Register passport strategies
require('./middleware/strategies/jwt');
require('./middleware/strategies/google');

// Middleware
const auth = require('./middleware/auth');
const PORT = process.env.PORT || 5000;

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected'))
    .catch((err: any) => console.log(err));

// Health check
app.get('/', (req: any, res: any) => {
    res.send('API server is running');
});

// Plug in routes
app.use('/api/auth', require('./routes/authentication'));
// app.use('/api/agent-availability', auth, require('./routes/agentAvailability'));
// app.use('/api/appointments', auth, require('./routes/appointments'));
app.use('/api/conversations', auth, require('./routes/conversationHistory'));
app.use('/api/messages', auth, require('./routes/messages'));
app.use('/api/profile', auth, require('./routes/profile'));
// app.use('/api/match', auth, require('./routes/agentMatching'));
app.use('/api/tickets', auth, require('./routes/tickets'));

app.get('/api/protected', auth, (req: any, res: any) => {
    res.json({ message: 'Authenticated!', user: req.user });
});


// = SOCKET.IO SETUP =
// 1. Create HTTP server from Express app
const server = http.createServer(app);

// 2. Setup Socket.IO (must be AFTER server is created)
const setupSocket = require('./socket');
setupSocket(server);

// 3. Start server (use server.listen, NOT app.listen)
server.listen(PORT, () => {
    console.log(`Server (Express + Socket.IO) running on port ${PORT}`);
});

// Initialize Redis
const { initRedis } = require('./src/redisClient');
(async () => {
  await initRedis();          // connect to Redis
  app.listen(4000, () => {
    console.log('Server on 4000');
  });
})();
