import {chai} from 'chai';
import chaiHttp from 'chai-http';
import app from '../src/server.js';
import userModel from '../src/models/user.model.js';
import customerModel from '../src/models/customer.model.js';
import sellerModel from '../src/models/seller.model.js';
import productModel from '../src/models/product.model.js';

chai.use(chaiHttp);
const expect = chai.expect;

let authToken;
let sellerAuthToken;
let productId;

before(async () => {
    // Register and login the customer
    await productModel.deleteMany({});
    await userModel.deleteMany({});
    await customerModel.deleteMany({});
    await sellerModel.deleteMany({});

    // Register and login the customer
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
    authToken = registerCustomerResponse.body.token;

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
        .post('/api/v1/customer')
        .set('Authorization', `Bearer ${authToken}`)
        .send(addCustomerData);

    expect(addCustomerResponse).to.have.status(200);

    const customerLoginResponse = await chai
        .request(app)
        .post('/api/v1/login')
        .send({
            email: 'customer@gmail.com',
            password: 'customer123',
        });

    expect(customerLoginResponse).to.have.status(200);
    expect(customerLoginResponse.body).to.have.property('token');
    authToken = customerLoginResponse.body.token;

    // Register a user as a seller for testing
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
        .set('Authorization', `Bearer ${sellerAuthToken}`)
        .send(addSellerData);

    expect(addSellerResponse).to.have.status(200);

    const authResponse = await chai
        .request(app)
        .post('/api/v1/login')
        .send({
            email: 'seller@gmail.com',
            password: 'seller123'
        });

    expect(authResponse).to.have.status(200);
    expect(authResponse.body).to.have.property('token');
    sellerAuthToken = authResponse.body.token;

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
});

describe('Wishlist Tests', () => {
    it('should get an empty wishlist', async () => {
        const response = await chai
            .request(app)
            .get('/api/v1/customer/wishlist')
            .set('Authorization', `Bearer ${authToken}`);

        expect(response).to.have.status(200);
        expect(response.body).to.have.property('message', 'Nothing in wishlist');
    });

    it('should add a product to the wishlist', async () => {
        const addWishlistResponse = await chai
            .request(app)
            .post('/api/v1/customer/wishlist')
            .set('Authorization', `Bearer ${authToken}`)
            .send({ productId });

        expect(addWishlistResponse).to.have.status(200);
        expect(addWishlistResponse.body).to.have.property('message', 'Wishlist product added');
    });

    it('should not add a product to the wishlist without productId', async () => {
        const addWishlistResponse = await chai
            .request(app)
            .post('/api/v1/customer/wishlist')
            .set('Authorization', `Bearer ${authToken}`)
            .send({});

        expect(addWishlistResponse).to.have.status(400);
        expect(addWishlistResponse.body).to.have.property('message', 'Fill all fields');
    });

    it('should not add a non-existing product to the wishlist', async () => {
        const addWishlistResponse = await chai
            .request(app)
            .post('/api/v1/customer/wishlist')
            .set('Authorization', `Bearer ${authToken}`)
            .send({ productId: 'nonexistentproductid' });

        expect(addWishlistResponse).to.have.status(404);
        expect(addWishlistResponse.body).to.have.property('message', 'Product not found');
    });

    it('should get the wishlist with one product', async () => {
        const response = await chai
            .request(app)
            .get('/api/v1/customer/wishlist')
            .set('Authorization', `Bearer ${authToken}`);

        expect(response).to.have.status(200);
        expect(response.body).to.have.property('message', 'Wishlist products');
        expect(response.body.wishlistProducts).to.have.lengthOf(1);
    });

    it('should remove a product from the wishlist', async () => {
        const deleteWishlistResponse = await chai
            .request(app)
            .delete('/api/v1/customer/wishlist')
            .set('Authorization', `Bearer ${authToken}`)
            .send({ productId });

        expect(deleteWishlistResponse).to.have.status(200);
        expect(deleteWishlistResponse.body).to.have.property('message', 'Wishlist product removed');
    });

    it('should not remove a product from the wishlist without productId', async () => {
        const deleteWishlistResponse = await chai
            .request(app)
            .delete('/api/v1/customer/wishlist')
            .set('Authorization', `Bearer ${authToken}`)
            .send({});

        expect(deleteWishlistResponse).to.have.status(400);
        expect(deleteWishlistResponse.body).to.have.property('message', 'Fill all fields');
    });
});

after(async () => {
    // Clean up: delete all data from the test database after running wishlist tests
    await productModel.deleteMany({});
    await userModel.deleteMany({});
    await customerModel.deleteMany({});
    await sellerModel.deleteMany({});
});
