const express = require('express');
const router = express.Router();
const User = require('../models/User');
const auth = require('../middleware/auth');

//All profile info - admin only
router.get('/all', auth, async (req: any, res: any) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Access denied: Admins only.' });
    }
    const users = await User.find({});
    res.json(users);
});


// Profile info - protected
router.get('/:id', auth, async (req: any, res: any) => {
    const user = await User.findById(req.params.id);
    res.json(user);
});

module.exports = router;
