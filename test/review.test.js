import chai from 'chai';
import chaiHttp from 'chai-http';
import app from '../src/server.js';
chai.use(chaiHttp);
const expect = chai.expect;

// Variables to store authentication tokens
let customerAuthToken;
let sellerAuthToken;

// Variable to store the product ID after creating a test product
let productId;

describe('Product Review Tests', () => {

  before(async () => {
    // Register and log in a customer
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

    // Add customer data
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
      .set('Authorization', customerAuthToken)
      .send(addCustomerData);

    expect(addCustomerResponse).to.have.status(200);

    // Log in the customer
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

    // Register and log in a seller
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

    // Add seller data
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

    // Log in the seller
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
  });


  describe('Get All Reviews of a Product', () => {
    it('should return 404 for a non-existent product', async () => {
      const response = await chai
        .request(app)
        .get('/api/v1/product/review?productId=nonExistentProductId')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response).to.have.status(404);
      expect(response.body).to.have.property('message').equal('Product not found');
    });

    it('should return all reviews for a specific product', async () => {
      const response = await chai
        .request(app)
        .get(`/api/v1/product/review?productId=${testProductId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response).to.have.status(200);
      expect(response.body).to.have.property('message').equal('Fetched All Reviews for Specific Product');
      expect(response.body).to.have.property('reviews').to.be.an('array');
    });
  });

  describe('Create a Review', () => {
    it('should return 400 for missing fields in review creation', async () => {
      const response = await chai
        .request(app)
        .post('/api/v1/product/review')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          productId: testProductId,
          // Missing msg and star fields intentionally
        });

      expect(response).to.have.status(400);
      expect(response.body).to.have.property('message').equal('Fill all fields in Review Add');
    });

    it('should return 404 for a non-existent product in review creation', async () => {
      const response = await chai
        .request(app)
        .post('/api/v1/product/review')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          productId: 'nonExistentProductId',
          msg: 'Test review message',
          star: 4,
        });

      expect(response).to.have.status(404);
      expect(response.body).to.have.property('message').equal('Product not found');
    });

    it('should create a new review for a specific product', async () => {
      const response = await chai
        .request(app)
        .post('/api/v1/product/review')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          productId: testProductId,
          msg: 'Test review message',
          star: 4,
        });

      expect(response).to.have.status(200);
      expect(response.body).to.have.property('message').equal('Review Added successfully');
      expect(response.body).to.have.property('existingProduct');
    });
  });

  describe('Update a Review', () => {
    it('should return 400 for missing fields in review update', async () => {
      const response = await chai
        .request(app)
        .patch('/api/v1/product/review')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          productId: testProductId,
          reviewId: testReviewId,
          // Missing msg and star fields intentionally
        });

      expect(response).to.have.status(400);
      expect(response.body).to.have.property('message').equal('Fill all fields in Review Update');
    });

    it('should return 404 for a non-existent product in review update', async () => {
      const response = await chai
        .request(app)
        .patch('/api/v1/product/review')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          productId: 'nonExistentProductId',
          reviewId: testReviewId,
          msg: 'Updated review message',
          star: 5,
        });

      expect(response).to.have.status(404);
      expect(response.body).to.have.property('message').equal('Product not found');
    });

    it('should return 404 for a non-existent review in review update', async () => {
      const response = await chai
        .request(app)
        .patch('/api/v1/product/review')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          productId: testProductId,
          reviewId: 'nonExistentReviewId',
          msg: 'Updated review message',
          star: 5,
        });

      expect(response).to.have.status(404);
      expect(response.body).to.have.property('message').equal('Review not found');
    });

    it('should return 403 for unauthorized review update', async () => {
      const unauthorizedAuthToken = 'token_of_another_user';
      const response = await chai
        .request(app)
        .patch('/api/v1/product/review')
        .set('Authorization', `Bearer ${unauthorizedAuthToken}`)
        .send({
          productId: testProductId,
          reviewId: testReviewId,
          msg: 'Updated review message',
          star: 5,
        });

      expect(response).to.have.status(403);
      expect(response.body).to.have.property('message').equal('You are not authorized to update this review');
    });

    it('should update an existing review for a specific product', async () => {
      const response = await chai
        .request(app)
        .patch('/api/v1/product/review')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          productId: testProductId,
          reviewId: testReviewId,
          msg: 'Updated review message',
          star: 5,
        });

      expect(response).to.have.status(200);
      expect(response.body).to.have.property('message').equal('Review Updated successfully');
      expect(response.body).to.have.property('existingProduct');
    });
  });

  describe('Delete a Review', () => {
    it('should return 400 for missing fields in review deletion', async () => {
      const response = await chai
        .request(app)
        .delete('/api/v1/product/review')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          productId: testProductId,
          // Missing reviewId intentionally
        });

      expect(response).to.have.status(400);
      expect(response.body).to.have.property('message').equal('Fill all fields in Review Delete');
    });

    it('should return 404 for a non-existent product in review deletion', async () => {
      const response = await chai
        .request(app)
        .delete('/api/v1/product/review')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          productId: 'nonExistentProductId',
          reviewId: testReviewId, // replace with an actual review ID
        });

      expect(response).to.have.status(404);
      expect(response.body).to.have.property('message').equal('Product not found or Review not found');
    });

    it('should return 200 for a successful review deletion', async () => {
      const response = await chai
        .request(app)
        .delete('/api/v1/product/review')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          productId: testProductId,
          reviewId: testReviewId, // replace with an actual review ID
        });

      expect(response).to.have.status(200);
      expect(response.body).to.have.property('message').equal('Review Deleted successfully');
    });
  });

  describe('Get All Reviews for a Seller', () => {
    it('should return 404 for a non-existent seller', async () => {
      const response = await chai
        .request(app)
        .get('/api/v1/product/review/seller')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response).to.have.status(404);
      expect(response.body).to.have.property('message').equal('Seller does not exist');
    });

    it('should return all reviews for a specific seller', async () => {
      const response = await chai
        .request(app)
        .get('/api/v1/product/review/seller')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response).to.have.status(200);
      expect(response.body).to.have.property('message').equal('Fetched All Reviews for Specific Seller');
      expect(response.body).to.have.property('reviews').to.be.an('array');
    });
  });

  after(async () => {
    // Clean up: delete all data from the test database after running product review tests
    await productModel.deleteMany({});
    await userModel.deleteMany({});
    await customerModel.deleteMany({});
    await sellerModel.deleteMany({});
    await orderModel.deleteMany({});;
  });
});
