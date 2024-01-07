import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;

const generateToken = async (user) => {
    const payload = {
        sub: user._id,
        email: user.email,
    };
    const options = {
        expiresIn: '7d',
    };
    const token = await jwt.sign(payload, JWT_SECRET, options);

    return token;
};

export default generateToken;
