import chai from 'chai';
import chaiHttp from 'chai-http';
import app from '../src/server.js';
import customerModel from '../src/models/customer.model.js';
import productModel from '../src/models/product.model.js';
import orderModel from '../src/models/order.model.js';
import sellerModel from '../src/models/seller.model.js';
import { promises as fs } from 'fs';

chai.use(chaiHttp);
const expect = chai.expect;


let customerAuthToken;
let sellerAuthToken;
let customerId;
let productId;

before(async () => {
    await productModel.deleteMany({});

    try {
        // Register and add data for customer
        const registerCustomerResponse = await chai
            .request(app)
            .post('/api/v1/register')
            .send({
                email: 'customer@gmail.com',
                password: 'customer123',
                type: 'Customer'
            });

        expect(registerCustomerResponse).to.have.status(200);
        expect(registerCustomerResponse.body).to.have.property('token');
        customerAuthToken = registerCustomerResponse.body.token;

        const addCustomerData = {
            user_address: {
                street_name: '123 Main St',
                area: 'Downtown',
                details: {
                    city: 'Cityville',
                    zip: 12345,
                    state: 'Stateville',
                    country: 'Countryland'
                }
            },
            contact_info: {
                num: {
                    contry_code: '+1',
                    number: '1234567890'
                },
                extra_num: {
                    contry_code: '+1',
                    number: '9876543210'
                },
                extra_email: 'extra@example.com'
            }
        };

        const addCustomerResponse = await chai
            .request(app)
            .post('/api/v1/customer') // Corrected endpoint to '/api/v1/customer'
            .set('Authorization', customerAuthToken)
            .send(addCustomerData);

        expect(addCustomerResponse).to.have.status(200);

        // Login customer
        const customerLoginResponse = await chai
            .request(app)
            .post('/api/v1/login')
            .send({
                email: 'customer@gmail.com',
                password: 'customer123',
            });

        expect(customerLoginResponse).to.have.status(200);
        expect(customerLoginResponse.body).to.have.property('token');
        customerAuthToken = customerLoginResponse.body.token;

        // Register, add data, and login for seller
        const registerSellerResponse = await chai
            .request(app)
            .post('/api/v1/register')
            .send({
                email: 'seller@gmail.com',
                password: 'seller123',
                type: 'Seller'
            });

        expect(registerSellerResponse).to.have.status(200);
        expect(registerSellerResponse.body).to.have.property('token');
        sellerAuthToken = registerSellerResponse.body.token;

        const addSellerData = {
            seller_address: {
                street_name: '123 Main St',
                area: 'Downtown',
                details: {
                    city: 'Cityville',
                    zip: 12345,
                    state: 'Stateville',
                    country: 'Countryland'
                }
            },
            contact_info: {
                num: {
                    contry_code: '+1',
                    number: '1234567890'
                },
                extra_num: {
                    contry_code: '+1',
                    number: '9876543210'
                },
                extra_email: 'extra@example.com'
            }
        };


        const addSellerResponse = await chai
            .request(app)
            .post('/api/v1/seller')
            .set('Authorization', sellerAuthToken)
            .send(addSellerData);

        expect(addSellerResponse).to.have.status(200);

        // Login seller
        const sellerLoginResponse = await chai
            .request(app)
            .post('/api/v1/login')
            .send({
                email: 'seller@gmail.com',
                password: 'seller123',
            });

        expect(sellerLoginResponse).to.have.status(200);
        expect(sellerLoginResponse.body).to.have.property('token');
        sellerAuthToken = sellerLoginResponse.body.token;

        // Create a product
        const createProductResponse = await chai
            .request(app)
            .post('/api/v1/product')
            .set('Authorization', `Bearer ${sellerAuthToken}`)
            .field('name', 'Test Product')
            .field('real_price', 50.00)
            .field('qty', 10)
            .field('discounted_rate', 10.00)
            .attach('files', './images/img1.jpg');

        expect(createProductResponse).to.have.status(200);
        productId = createProductResponse.body.productId;

        // Get the customer ID
        const customer = await customerModel.findOne({ user_id: customerLoginResponse.body.user._id });
        customerId = customer.user_id;

    } catch (error) {
        console.error(`Error reading or parsing file: ${error}`);
    }
});


describe('Checkout and Order Tests', () => {
    describe('Checkout', () => {

        it('should successfully checkout and place an order', async () => {
            const checkoutResponse = await chai
                .request(app)
                .post('/api/v1/checkout')
                .set('Authorization', `Bearer ${customerAuthToken}`)
                .send({
                    products: [{ PID: productId, qty: 2 }],
                    shippingAddress: {
                        street_name: '123 Street',
                        area: 'Test Area',
                        details: {
                            city: 'Test City',
                            zip: 12345,
                            state: 'Test State',
                            country: 'Test Country'
                        }
                    },
                    paymentMethod: 'tok_visa'
                });

            expect(checkoutResponse).to.have.status(200);
            expect(checkoutResponse.body).to.have.property('message', 'Order placed successfully');
            expect(checkoutResponse.body).to.have.property('order');

            // Get the order ID for further testing
            const orderId = checkoutResponse.body.order.order_id;

            // Check if the product quantity is decreased
            const updatedProduct = await productModel.findById(productId);
            expect(updatedProduct.qty).to.equal(8);

            // Check if the order is present in the customer's order_info
            const customer = await customerModel.findById(customerId);
            const orderExistsInCustomer = customer.order_info.some(order => order.equals(orderId));
            expect(orderExistsInCustomer).to.be.true;

            // Check if the order status is "Placed Order"
            const order = await orderModel.findById(orderId);
            expect(order).to.have.property('status', 'Placed Order');
        });

        it('should fail to checkout due to out-of-stock product', async () => {
            const checkoutResponse = await chai
                .request(app)
                .post('/api/v1/checkout')
                .set('Authorization', `Bearer ${customerAuthToken}`)
                .send({
                    products: [{ PID: productId, qty: 20 }], // Quantity exceeds available stock
                    paymentMethod: 'tok_visa'
                });

            expect(checkoutResponse).to.have.status(200);
            expect(checkoutResponse.body).to.have.property('message', 'Some products are out of stock or have insufficient quantity');
            expect(checkoutResponse.body).to.have.property('storeProductId');
            expect(checkoutResponse.body.storeProductId).to.be.an('array');
            expect(checkoutResponse.body.storeProductId).to.include(productId);
        });

        it('should fail to checkout with invalid product ID', async () => {
            const invalidProductId = 'invalid-product-id';

            const checkoutResponse = await chai
                .request(app)
                .post('/api/v1/checkout')
                .set('Authorization', `Bearer ${customerAuthToken}`)
                .send({
                    products: [{ PID: invalidProductId, qty: 2 }],
                    shippingAddress: {
                        street_name: '123 Street',
                        area: 'Test Area',
                        details: {
                            city: 'Test City',
                            zip: 12345,
                            state: 'Test State',
                            country: 'Test Country'
                        }
                    },
                    paymentMethod: 'tok_visa'
                });

            expect(checkoutResponse).to.have.status(404);
            expect(checkoutResponse.body).to.have.property('message', 'Product not found');
        });

        it('should fail to checkout with missing payment method', async () => {
            const checkoutResponse = await chai
                .request(app)
                .post('/api/v1/checkout')
                .set('Authorization', `Bearer ${customerAuthToken}`)
                .send({
                    products: [{ PID: productId, qty: 2 }],
                    shippingAddress: {
                        street_name: '123 Street',
                        area: 'Test Area',
                        details: {
                            city: 'Test City',
                            zip: 12345,
                            state: 'Test State',
                            country: 'Test Country'
                        }
                    }
                    // Missing payment method
                });

            expect(checkoutResponse).to.have.status(400);
            expect(checkoutResponse.body).to.have.property('message', 'Fill all required fields in checkout');
        });

        it('should fail to checkout with empty product list', async () => {
            const checkoutResponse = await chai
                .request(app)
                .post('/api/v1/checkout')
                .set('Authorization', `Bearer ${customerAuthToken}`)
                .send({
                    products: [],
                    shippingAddress: {
                        street_name: '123 Street',
                        area: 'Test Area',
                        details: {
                            city: 'Test City',
                            zip: 12345,
                            state: 'Test State',
                            country: 'Test Country'
                        }
                    },
                    paymentMethod: 'tok_visa'
                });

            expect(checkoutResponse).to.have.status(400);
            expect(checkoutResponse.body).to.have.property('message', 'Fill all required fields in checkout');
        });

        it('should fail to checkout with missing shipping address', async () => {
            const checkoutResponse = await chai
                .request(app)
                .post('/api/v1/checkout')
                .set('Authorization', `Bearer ${customerAuthToken}`)
                .send({
                    products: [{ PID: productId, qty: 2 }],
                    // Missing shipping address
                    paymentMethod: 'tok_visa'
                });

            expect(checkoutResponse).to.have.status(400);
            expect(checkoutResponse.body).to.have.property('message', 'Fill all required fields in checkout');
        });

        it('should fail to checkout with invalid payment token', async () => {
            const checkoutResponse = await chai
                .request(app)
                .post('/api/v1/checkout')
                .set('Authorization', `Bearer ${customerAuthToken}`)
                .send({
                    products: [{ PID: productId, qty: 2 }],
                    shippingAddress: {
                        street_name: '123 Street',
                        area: 'Test Area',
                        details: {
                            city: 'Test City',
                            zip: 12345,
                            state: 'Test State',
                            country: 'Test Country'
                        }
                    },
                    paymentMethod: 'invalid-payment-token'
                });

            expect(checkoutResponse).to.have.status(200);
            expect(checkoutResponse.body).to.have.property('message', 'Payment failed');
        });
    });
    describe('Order Status Update', () => {

        it('should successfully update order status', async () => {
            // Create a test order first
            const createOrderResponse = await chai
                .request(app)
                .post('/api/v1/checkout')
                .set('Authorization', `Bearer ${customerAuthToken}`)
                .send({
                    products: [{ PID: productId, qty: 2 }],
                    shippingAddress: {
                        street_name: '123 Street',
                        area: 'Test Area',
                        details: {
                            city: 'Test City',
                            zip: 12345,
                            state: 'Test State',
                            country: 'Test Country'
                        }
                    },
                    paymentMethod: 'tok_visa'
                });

            expect(createOrderResponse).to.have.status(200);
            const orderId = createOrderResponse.body.order.order_id;

            // Update order status
            const updateOrderResponse = await chai
                .request(app)
                .patch('/api/v1/order/status')
                .set('Authorization', `Bearer ${sellerAuthToken}`)
                .send({
                    orderId,
                    status: 'Dispatched'
                });

            expect(updateOrderResponse).to.have.status(200);
            expect(updateOrderResponse.body).to.have.property('message', 'Order Updated successfully');
        });

        it('should fail to checkout with insufficient product quantity', async () => {
            const insufficientQuantityProductId = 'insufficient-quantity-product-id';

            // Ensure the product has insufficient quantity
            const insufficientQuantityProduct = await chai
                .request(app)
                .patch(`/api/v1/product?productId=${insufficientQuantityProductId}`)
                .set('Authorization', `Bearer ${sellerAuthToken}`)
                .send({
                    qty: 0 // Set quantity to 0 to simulate insufficient quantity
                });

            expect(insufficientQuantityProduct).to.have.status(200);
            expect(insufficientQuantityProduct.body).to.have.property('message', 'Product updated successfully');

            // Attempt to checkout with insufficient quantity
            const checkoutResponse = await chai
                .request(app)
                .post('/api/v1/checkout')
                .set('Authorization', `Bearer ${customerAuthToken}`)
                .send({
                    products: [{ PID: insufficientQuantityProductId, qty: 2 }],
                    shippingAddress: {
                        street_name: '123 Street',
                        area: 'Test Area',
                        details: {
                            city: 'Test City',
                            zip: 12345,
                            state: 'Test State',
                            country: 'Test Country'
                        }
                    },
                    paymentMethod: 'tok_visa'
                });

            expect(checkoutResponse).to.have.status(200);
            expect(checkoutResponse.body).to.have.property('message', 'Some products are out of stock or have insufficient quantity');
            expect(checkoutResponse.body).to.have.property('storeProductId');
            expect(checkoutResponse.body.storeProductId).to.be.an('array').that.includes(insufficientQuantityProductId);
        });

    });
    describe('Get Customer Orders', () => {
        it('should successfully get all customer orders', async () => {
            const getAllOrdersResponse = await chai
                .request(app)
                .get('/api/v1/orders/customer')
                .set('Authorization', `Bearer ${customerAuthToken}`);

            expect(getAllOrdersResponse).to.have.status(200);
            expect(getAllOrdersResponse.body).to.have.property('message', 'Order data getting successfully');
            expect(getAllOrdersResponse.body).to.have.property('responceData');
            expect(getAllOrdersResponse.body.responceData).to.be.an('array');
        });

        it('should successfully get a specific customer order', async () => {
            // Create a test order first
            const createOrderResponse = await chai
                .request(app)
                .post('/api/v1/checkout')
                .set('Authorization', `Bearer ${customerAuthToken}`)
                .send({
                    products: [{ PID: productId, qty: 2 }],
                    shippingAddress: {
                        street_name: '123 Street',
                        area: 'Test Area',
                        details: {
                            city: 'Test City',
                            zip: 12345,
                            state: 'Test State',
                            country: 'Test Country'
                        }
                    },
                    paymentMethod: 'tok_visa'
                });

            expect(createOrderResponse).to.have.status(200);
            const orderId = createOrderResponse.body.order.order_id;

            // Get the specific order
            const getOrderResponse = await chai
                .request(app)
                .get('/api/v1/orders/customer')
                .set('Authorization', `Bearer ${customerAuthToken}`)
                .send({
                    orderId
                });

            expect(getOrderResponse).to.have.status(200);
            expect(getOrderResponse.body).to.have.property('message', 'Order data successfully');
            expect(getOrderResponse.body).to.have.property('responseData');
            expect(getOrderResponse.body.responseData).to.be.an('object');
            expect(getOrderResponse.body.responseData).to.have.property('_id', orderId);
        });

    });
    describe('Get Seller Orders', () => {
        it('should successfully get all seller orders', async () => {
            const getAllOrdersResponse = await chai
                .request(app)
                .get('/api/v1/orders/seller')
                .set('Authorization', `Bearer ${sellerAuthToken}`);

            expect(getAllOrdersResponse).to.have.status(200);
            expect(getAllOrdersResponse.body).to.have.property('message', 'Order data getting successfully');
            expect(getAllOrdersResponse.body).to.have.property('responceData');
            expect(getAllOrdersResponse.body.responceData).to.be.an('array');
        });

        it('should successfully get a specific seller order', async () => {
            // Create a test order first
            const createOrderResponse = await chai
                .request(app)
                .post('/api/v1/checkout')
                .set('Authorization', `Bearer ${customerAuthToken}`)
                .send({
                    products: [{ PID: productId, qty: 2 }],
                    shippingAddress: {
                        street_name: '123 Street',
                        area: 'Test Area',
                        details: {
                            city: 'Test City',
                            zip: 12345,
                            state: 'Test State',
                            country: 'Test Country'
                        }
                    },
                    paymentMethod: 'tok_visa'
                });

            expect(createOrderResponse).to.have.status(200);
            const orderId = createOrderResponse.body.order.order_id;

            // Get the specific order as a seller
            const getOrderResponse = await chai
                .request(app)
                .get('/api/v1/orders/seller')
                .set('Authorization', `Bearer ${sellerAuthToken}`)
                .send({
                    orderId
                });

            expect(getOrderResponse).to.have.status(200);
            expect(getOrderResponse.body).to.have.property('message', 'Order data successfully');
            expect(getOrderResponse.body).to.have.property('responseData');
            expect(getOrderResponse.body.responseData).to.be.an('object');
            expect(getOrderResponse.body.responseData).to.have.property('_id', orderId);
        });

    });
    describe('Order Status Update for Seller', () => {
        it('should fail to update order status without orderId', async () => {
            const updateOrderStatusResponse = await chai
                .request(app)
                .patch('/api/v1/order/status')
                .set('Authorization', `Bearer ${sellerAuthToken}`)
                .send({
                    status: 'Dispatched'
                });

            expect(updateOrderStatusResponse).to.have.status(400);
            expect(updateOrderStatusResponse.body).to.have.property('message', 'Provide Order ID');
        });

        it('should fail to update order status with non-existing orderId', async () => {
            const nonExistingOrderId = 'non-existing-order-id';

            const updateOrderStatusResponse = await chai
                .request(app)
                .patch('/api/v1/order/status')
                .set('Authorization', `Bearer ${sellerAuthToken}`)
                .send({
                    orderId: nonExistingOrderId,
                    status: 'Dispatched'
                });

            expect(updateOrderStatusResponse).to.have.status(400);
            expect(updateOrderStatusResponse.body).to.have.property('message', 'Order does not exist in the seller\'s order_info');
        });

        it('should successfully update order status', async () => {
            // Create a test order first
            const createOrderResponse = await chai
                .request(app)
                .post('/api/v1/checkout')
                .set('Authorization', `Bearer ${customerAuthToken}`)
                .send({
                    products: [{ PID: productId, qty: 2 }],
                    shippingAddress: {
                        street_name: '123 Street',
                        area: 'Test Area',
                        details: {
                            city: 'Test City',
                            zip: 12345,
                            state: 'Test State',
                            country: 'Test Country'
                        }
                    },
                    paymentMethod: 'tok_visa'
                });

            expect(createOrderResponse).to.have.status(200);
            const orderId = createOrderResponse.body.order.order_id;

            // Update the status of the test order
            const updateOrderStatusResponse = await chai
                .request(app)
                .patch('/api/v1/order/status')
                .set('Authorization', `Bearer ${sellerAuthToken}`)
                .send({
                    orderId,
                    status: 'Dispatched'
                });

            expect(updateOrderStatusResponse).to.have.status(200);
            expect(updateOrderStatusResponse.body).to.have.property('message', 'Order Updated successfully');
            expect(updateOrderStatusResponse.body).to.have.property('orderId', orderId);
        });
    });
});

after(async () => {
    // Clean up: delete all data from the test database
    await productModel.deleteMany({});
    await userModel.deleteMany({});
    await customerModel.deleteMany({});
    await sellerModel.deleteMany({});
    await orderModel.deleteMany({});;
});
