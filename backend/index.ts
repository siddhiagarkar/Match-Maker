const mongoose = require('mongoose'); //MongoDB ODM library for Node.js applications (define schemas and models; simplifies database operations)
const express = require('express'); //Fast, minimalist web framework for Node.js (builds REST APIs, routes, HTTP server logic, middleware)
const cors = require('cors'); //Allows your API to be called from browsers/clients hosted on different domains, needed for real frontend-backend development
const dotenv = require('dotenv'); //Loads environment variables from a .env file into process.env (securely manage sensitive config data like DB connection strings, API keys)
const passport = require('passport'); //Authentication middleware for Node.js (supports various strategies like JWT, OAuth; manages user sessions and auth flows)

//registering models with Mongoose
const User = require('./models/User');
const Message = require('./models/Message');
const Conversation = require('./models/Conversation');
const AgentAvailability = require('./models/AgentAvailability');
const Appointment = require('./models/Appointment');

// Load env
dotenv.config();

// Connect to DB
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected'))
    .catch((err:any) => console.log(err));

//create Express app
const app = express();

//lets Express parse JSON bodies in requests like POST/PUT... and makes them available under req.body (as JS object)
app.use(express.json());

//Allows browsers or external (frontend) clients on other domains to access your backend API
app.use(cors());

// Passport setup - Initializes Passport.js for authentication
app.use(passport.initialize());

// Require strategies (registers them both)
require('./middleware/strategies/jwt');
require('./middleware/strategies/google');

// Middleware
const auth = require('./middleware/auth'); //plug-and-play Passport authentication middleware
const PORT = process.env.PORT || 5000;

// Health check route
app.get('/', (req: any, res: any) => {
    res.send('API server is running');
});


//Plugging Route Files into Main App
app.use('/api/auth', require('./routes/authentication'));
app.use('/api/agent-availability', auth, require('./routes/agentAvailability'));
app.use('/api/appointments', auth, require('./routes/appointments'));
app.use('/api/conversations', auth, require('./routes/conversationHistory'));
app.use('/api/messages', auth, require('./routes/messages'));
app.use('/api/profile', auth, require('./routes/profile'));

//// Route to start Google Auth flow
//app.get('/auth/google',
//    passport.authenticate('google', { scope: ['profile', 'email'] })
//);

//// Callback route for Google to redirect after authentication
//app.get('/auth/google/callback',
//    passport.authenticate('google', { failureRedirect: '/login', session: false }),
//    (req: any, res: any) => {
//        // Send back JWT to client or handle successful login
//        // Example: redirect to front-end with a token
//        const jwt = require('jsonwebtoken');
//        const token = jwt.sign({ id: req.user._id, role: req.user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });
//        res.redirect(`http://localhost:3000?token=${token}`); // Or res.json({token}) for API usage
//    }
//);


// Example protected route using passport plug-and-play
app.get('/api/protected', auth, (req: any, res: any) => {
    res.json({ message: 'Authenticated!', user: req.user });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
