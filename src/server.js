import express from 'express';
const app = express();
import 'dotenv/config'
const PORT = process.env.PORT;
import passport from './auth/local.Passport.js';
import passportJWT from './auth/jwt.Passport.js'; 
import connectDB from './config/mongoDBConnect.js'; // Auto-Connected - For more view code files
import bodyParser from 'body-parser';
connectDB();
import morgan from 'morgan';

// Middlewares
app.use(morgan('combined'));
app.use(express.json());
app.use(bodyParser.json())
app.use(express.urlencoded({ extended: false }));
app.use(passport.initialize());
app.use(passportJWT.initialize());

// Routes Imports
import AuthRoutes from './routes/auth.Routes.js';
import CustomerRoutes from './routes/customer.Routes.js';
import OrderRoutes from './routes/order.Routes.js';
import ProductRoutes from './routes/product.Routes.js';
import SellerRoutes from './routes/seller.Routes.js';

app.use('/api/v1', AuthRoutes);
app.use('/api/v1', CustomerRoutes);
app.use('/api/v1', OrderRoutes);
app.use('/api/v1', ProductRoutes);
app.use('/api/v1', SellerRoutes);

app.listen(PORT, () => {
    console.log(`Server is running on ${PORT}`);
});

export default app;