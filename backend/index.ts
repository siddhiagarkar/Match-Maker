const mongoose = require('mongoose'); //MongoDB ODM library for Node.js applications (define schemas and models; simplifies database operations)
const express = require('express'); //Fast, minimalist web framework for Node.js (builds REST APIs, routes, HTTP server logic, middleware)
const cors = require('cors'); //Allows your API to be called from browsers/clients hosted on different domains, needed for real frontend-backend development
const dotenv = require('dotenv'); //Loads environment variables from a .env file into process.env (securely manage sensitive config data like DB connection strings, API keys)
const passport = require('passport'); //Authentication middleware for Node.js (supports various strategies like JWT, OAuth; manages user sessions and auth flows)

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
const validate = require('./middleware/inputValidate'); //middleware for input validation (e.g., checking request body matches a schema)
const { registerSchema, loginSchema } = require('./middleware/validationSchema'); //import Joi validation schemas

const PORT = process.env.PORT || 5000;

// Health check route
app.get('/', (req: any, res: any) => {
    res.send('API server is running');
});

// User model & bcrypt
const User = require('./models/User');
const bcrypt = require('bcryptjs');

// Registration route
app.post('/api/register', validate(registerSchema), async (req: any, res: any) => {

    //destructure request data
    const { name, email, password, role } = req.body;
    const hashedPassword = await bcrypt.hash(password, 12);
    try {
        const user = new User({ name, email, password: hashedPassword, role }); //Prepares a new Mongoose User document
        await user.save();
        res.status(201).json({ message: 'User registered' });
    } catch (err) {
        res.status(400).json({ error: 'Email already exists' });
    }
});

// Login route (returns JWT for client usage)
const jwt = require('jsonwebtoken');

app.post('/api/login', validate(loginSchema), async (req: any, res: any) => {

    //destructure request data
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: 'Invalid credentials. No user with provided email.' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: 'Invalid credentials. Check your password.' });

    // Issue JWT for authentication. This token is what the frontend will store and send for protected API calls
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.json({ token, role: user.role });
});


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
