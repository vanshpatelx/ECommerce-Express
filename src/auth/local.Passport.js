const passportLocal = require('passport');
const LocalStrategy = require('passport-local').Strategy;
// const CryptoJS = require("crypto-js");
const hashingstr = require('hashingstr');
const HashAlgo = process.env.HashAlgo;


const User = require('../models/user.Model');

passportLocal.use(new LocalStrategy({ usernameField: 'email' }, async (email, password, done) => {
    try {
        const user = await User.findOne({ email: email });

        if (!user) {
            return done(null, false, { message: 'User not found' });
        }

        const hashedPassword = await hashingstr.hash(HashAlgo, password, user.password);

        console.log(hashedPassword);
        if (hashedPassword) {
            // Passwords match
            return done(null, user);
        } else {
            // Passwords do not match
            return done(null, false, { message: 'Incorrect password' });
        }
    } catch (err) {
        return done(err);
    }
}));


passportLocal.serializeUser((user, done) => {
    done(null, user.id);
});

// Deserialize user from session
passportLocal.deserializeUser((id, done) => {
    User.findById(id, (err, user) => {
        done(err, user);
    });
});



module.exports = passportLocal;
