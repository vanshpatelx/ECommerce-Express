const userModel = require("../models/user.Model");
const generateToken = require('../auth/jwt');
const passportLocal = require('../auth/local.Passport');
const hashingstr = require('hashingstr');
const HashAlgo = process.env.HashAlgo;

const registerUser = async (req, res) => {
    try {
        const { email, password, type, seller_id, customer_id } = req.body;

        if (!email || !password || !type) {
            return res.status(400).json({
                message: 'Fill all fields'
            });
        }

        // Is already register ? Check in DB
        const isAlreadyExists = await userModel.find({ email: email });
        if (isAlreadyExists.length > 0) {
            return res.status(400).json({
                message: 'Email is already registered'
            });
        }

        // Encrypt password
        // const hashedPassword = await CryptoJS.AES.encrypt(password, CryptoSECRET).toString();
        const hashedPassword = await hashingstr.hash(HashAlgo, password);

        const newUser = new userModel({
            email: email,
            password: hashedPassword,
            type: type,
            seller_id: null,
            customer_id: null,
        })

        await newUser.save();

        // JWT
        const token = await generateToken(newUser);

        return res.status(200).json({ message: 'User registered successfully', token });
    } catch (err) {
        return res.status(500).json({ message: 'Error in Registering User' });
    }
};

const loginUser = (req, res) => {
    passportLocal.authenticate('local', { session: false }, async (err, user) => {
      if (err) {
        return res.status(500).json({ message: 'Error during authentication', error: err.message });
      }
      if (!user) {
        return res.status(401).json({ message: 'Incorrect email or password.' });
      }
  
      // Generating Token
      const token = await generateToken(user);
      res.json({ message: 'User logged in successfully', token });
    })(req, res);
  };
  

module.exports = {
    registerUser,
    loginUser
}