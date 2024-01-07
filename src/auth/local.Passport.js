import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import hashingstr, { hash } from 'hashingstr';
import User from '../models/user.Model.js';

const HashAlgo = process.env.HashAlgo;
/**
 * Local Passport configuration.
 */

passport.use(new LocalStrategy({ usernameField: 'email' }, async (email, password, done) => {
    try {
        const user = await User.findOne({ email: email });

        if (!user) {
            return done(null, false, { message: 'User not found' });
        }

        const x = await hashingstr.hash(HashAlgo, password);

        if(x == user.password){
            return done(null, user);
        } else {
            // Passwords do not match
            return done(null, false, { message: 'Incorrect password' });
        }
    } catch (err) {
        return done(err);
    }
}));

passport.serializeUser((user, done) => {
    done(null, user.id);
});

// Deserialize user from session
passport.deserializeUser((id, done) => {
    User.findById(id, (err, user) => {
        done(err, user);
    });
});

export default passport;
