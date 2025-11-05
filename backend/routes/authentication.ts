const express = require('express');
const router: any = express.Router();

const User = require('../models/User');
const AgentAvailability = require('../models/AgentAvailability'); // Adjust path as needed

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const validate = require('../middleware/inputValidate');
const { registerSchema, loginSchema } = require('../middleware/validationSchema'); //import Joi validation schemas

//REGISTER ENDPOINT
router.post('/register', validate(registerSchema), async (req: any, res: any) => {
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


//LOGIN ENDPOINT (returns JWT for client usage)
router.post('/login', validate(loginSchema), async (req: any, res: any) => {

    //destructure request data
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: 'Invalid credentials. No user with provided email.' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: 'Invalid credentials. Check your password.' });

    // Issue JWT for authentication. This token is what the frontend will store and send for protected API calls
    const token = jwt.sign({ _id: user._id, role: user.role, name: user.name }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.json({ token, role: user.role, name: user.name, _id: user._id });

});

const auth = require('../middleware/auth');

//LOGOUT ENDPOINT
router.post('/logout', auth, async (req: any, res: any) => {
    try {
        // Check if user is authenticated
        if (!req.user) {
            return res.status(401).json({ error: 'Not authenticated.' });
        }

        const { id, role } = req.user;

        // If agent/employee, set their availability to false
        if (role === 'agent') {
            await AgentAvailability.findOneAndUpdate(
                { agent: id },
                { $set: { availability: false } },
                { new: true }
            );
        }

        // For JWT, logout = instructing frontend to forget the token
        res.json({ message: 'Logged out successfully.' });
    } catch (err) {
        console.error('Logout error:', err); // Add logging to see the actual error
        res.status(500).json({ error: 'Logout failed.' });
    }
});

module.exports = router;
