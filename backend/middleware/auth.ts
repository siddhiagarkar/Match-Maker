const passport = require('passport');

// Always require at least one strategy.
require('./strategies/jwt');

module.exports = passport.authenticate(process.env.AUTH_STRATEGY || 'jwt', { session: false });
