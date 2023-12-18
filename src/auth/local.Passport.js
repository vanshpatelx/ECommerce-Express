const passportLocal = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User = require('../models/user.Model');

passportLocal.use(new LocalStrategy((email, password, done) => {
    User.findOne({ email: email }, (err, user) => {
        if (err) { return done(err); }
        if (!user || !user.verifyPassword(password)) {
            return done(null, false, { message: 'Incorrect email or password.' });
        }
        return done(null, user);
    });
}));



module.exports = passportLocal;
