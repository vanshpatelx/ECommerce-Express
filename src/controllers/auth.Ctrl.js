const userModel = require("../models/user.Model");
const CryptoJS = require("crypto-js");
const CryptoSECRET = process.env.CryptoSECRET;
const generateToken = require('../auth/jwt');
const passportLocal = require('../auth/local.Passport');


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
        const hashedPassword = await CryptoJS.AES.encrypt(password, CryptoSECRET).toString();

        const newUser = new userModel({
            email: email,
            password: hashedPassword,
            type: type,
            seller_id: null,
            customer_id: null,
        })

        await newUser.save();

        // JWT
        const token = generateToken(newUser);

        return res.status(200).json({ message: 'User registered successfully', token });
    } catch (err) {
        return res.status(500).json({ message: 'Error in Registering User' });
    }
};

const loginUser = async (req, res) => {
    passportLocal.authenticate('local', { session: false }, (err, user) => {
        const token = generateToken(user);
        res.json({ message: 'User logged in successfully', token });
    })(req, res);
};


module.exports = {
    registerUser,
    loginUser
}