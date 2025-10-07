const express = require('express');
const router = express.Router();
const User = require('../models/User');
const auth = require('../middleware/auth');

// Profile info - protected
router.get('/:id', auth, async (req: any, res: any) => {
    const user = await User.findById(req.params.id);
    res.json(user);
});

module.exports = router;
