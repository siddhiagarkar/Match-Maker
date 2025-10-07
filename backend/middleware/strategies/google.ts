const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../../models/User');

passport.use(new GoogleStrategy(
    {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5000/auth/google/callback'
    },
    async (accessToken: any, refreshToken: any, profile: any, done: any) => {
        try {
            let user = await User.findOne({ googleId: profile.id });
            if (!user) {
                user = await User.create({
                    name: profile.displayName,
                    email: profile.emails && profile.emails[0] && profile.emails[0].value,
                    googleId: profile.id,
                    role: 'client'
                });
            }
            return done(null, user);
        } catch (err) {
            return done(err, undefined);
        }
    }
));
