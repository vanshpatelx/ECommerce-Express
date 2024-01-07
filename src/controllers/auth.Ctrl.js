import userModel from '../models/user.Model.js';
import generateToken from '../auth/jwt.js';
import passportLocal from '../auth/local.Passport.js';
import hashingstr from 'hashingstr';
const HashAlgo = process.env.HashAlgo;

const registerUser = async (req, res) => {
    try {
        const { email, password, type } = req.body;

        if (!email || !password || !type) {
            return res.status(400).json({
                message: 'Fill all fields'
            });
        }

        // Validate 'type' field against predefined values
        const validUserTypes = ['Customer', 'Seller']; // Add more if needed
        if (!validUserTypes.includes(type)) {
            return res.status(400).json({ message: 'Invalid user type' });
        }

        // Is already registered? Check in DB
        const isAlreadyExists = await userModel.find({ email: email });
        if (isAlreadyExists.length != 0) {
            return res.status(400).json({
                message: 'Email is already registered'
            });
        }

        // Encrypt password
        const hashedPassword = await hashingstr.hash(HashAlgo, password);

        const newUser = new userModel({
            email: email,
            password: hashedPassword,
            type: type,
            seller_id: null,
            customer_id: null,
        });

        await newUser.save();

        // JWT
        const token = await generateToken(newUser);

        return res.status(200).json({ message: 'User registered successfully', token });
    } catch (err) {
        return res.status(500).json({ message: 'Error in Registering User', error: err.message });
    }

};

const loginUser = (req, res) => {
    if (!req.body.email || !req.body.password) {
        return res.status(400).json({ message: 'Fill all fields' });
    }

    passportLocal.authenticate('local', { session: false }, async (err, user) => {
        if (err) {
            return res.status(500).json({ message: 'Error during authentication', error: err.message });
        }
        if (!user) {
            return res.status(401).json({ message: 'Incorrect email or password.' });
        }

        // Generating Token
        const token = await generateToken(user);
        return res.status(200).json({ message: 'User logged in successfully', token });
    })(req, res);
};

export {
    registerUser,
    loginUser
};
