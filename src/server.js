const express = require('express');
const app = express();
require('dotenv').config();
const PORT = process.env.PORT;
const passportLocal = require('./auth/local.Passport');
const passportJWT = require('./auth/jwt.Passport');


// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(passportLocal.initialize());
app.use(passportJWT.initialize());



// Routes Imports
const AuthRoutes = require('./routes/auth.Routes');
const CustomerRoutes = require('./routes/customer.Routes');
const OrderRoutes = require('./routes/order.Routes');
const ProductRoutes = require('./routes/product.Routes');
const SellerRoutes = require('./routes/seller.Routes');

app.use('/api/v1', AuthRoutes);
app.use('/api/v1', CustomerRoutes);
app.use('/api/v1', OrderRoutes);
app.use('/api/v1', ProductRoutes);
app.use('/api/v1', SellerRoutes);


app.listen(PORT, () => {
    console.log(`Server is running on ${PORT}`);
})