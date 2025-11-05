//Passport.js library which is used as middleware for authentication
const passport = require('passport');


const JwtStrategy = require('passport-jwt').Strategy; //JWT strategy for Passport
const ExtractJwt = require('passport-jwt').ExtractJwt; //Helper functions to extract JWT from requests
const User = require('../../models/User');

const opts = {
    //"Bearer token" refers to how the token is sent in an HTTP request
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SECRET
};

passport.use(
    new JwtStrategy(opts, async (jwt_payload: any, done: any) => {
        try {
            //jwt_payload is the decoded JWT payload we signed in login route (contains user id and role)
            const user = await User.findById(jwt_payload._id);
            if (user) return done(null, user);
            else return done(null, false);
        } catch (err) {
            return done(err, false);
        }
    })
);
