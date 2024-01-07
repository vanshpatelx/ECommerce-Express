import supertest from 'supertest';
import app from '../src/server.js';
import productModel from '../src/models/product.model.js';
import { expect } from 'chai';
import customerModel from '../src/models/customer.Model.js';
import userModel from '../src/models/user.Model.js';
import sellerModel from '../src/models/seller.Model.js';
import path from 'path';
import authModel from '../src/models/user.Model.js';


const currentModuleURL = new URL(import.meta.url);
const currentDir = path.dirname(currentModuleURL.pathname);

const request = supertest(app);

let authToken;
let testProductId;
let sellerId;

describe('Product Fetch Tests', () => {
  before(async function () {
    this.timeout(50000);

    await productModel.deleteMany({});
    await customerModel.deleteMany({});
    await userModel.deleteMany({});
    await sellerModel.deleteMany({});


    const registerResponse = await request
      .post('/api/v1/register')
      .send({
        email: 'seller@gmail.com',
        password: 'seller123',
        type: 'Seller'
      });

    expect(registerResponse.status).to.equal(200);
    expect(registerResponse.body).to.have.property('token');
    authToken = registerResponse.body.token;

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

    const addSellerResponse = await request
      .post('/api/v1/seller')
      .set('Authorization', authToken)
      .send(addSellerData);

    expect(addSellerResponse.status).to.equal(200);

    const loginResponse = await request
      .post('/api/v1/login')
      .send({
        email: 'seller@gmail.com',
        password: 'seller123'
      });

    expect(loginResponse.status).to.equal(200);
    expect(loginResponse.body).to.have.property('token');
    authToken = loginResponse.body.token;

    const images = [
      path.join(currentDir, 'images', 'img1.jpg'),
    ];

    const createProductResponse = await request
      .post('/api/v1/product')
      .set('Authorization', authToken)
      .field('name', 'Test Product')
      .field('real_price', 50.00)
      .field('qty', 10)
      .field('discounted_rate', 10.00)
      .attach('files', images[0]);

    expect(createProductResponse.status).to.equal(200);
    testProductId = createProductResponse.body.productId;

    const seller = await authModel.findOne({email : 'seller@gmail.com'});

    // const seller = await productModel.findOne({ seller: loginResponse.body.user._id });
    sellerId = seller._id.toString();
  });

  describe('Get Specific Product', () => {
    it('should return 404 when fetching a non-existent product', async function () {
      this.timeout(15000);
      const response = await request
        .get('/api/v1/product')
        .query({ productId: '6589bac5c7c0ab1ca35dd49x' })
        .set('Authorization', authToken);

      expect(response.status).to.equal(404);
      expect(response.body).to.have.property('message').equal('Product not found');
    });

    it('should return a specific product when fetching by valid ID', async function () {
      this.timeout(15000);
      const response = await request
        .get('/api/v1/product')
        .query({ productId: testProductId })
        .set('Authorization', authToken);

      expect(response.status).to.equal(200);
      expect(response.body).to.have.property('message').equal('Fetched Specific Product');
      expect(response.body).to.have.property('existingProduct');
      expect(response.body.existingProduct).to.have.property('seller').equal(null); // Seller details should be hidden
    });
  });

  describe('Get All Products', () => {
    it('should return 404 when fetching all products if none exist', async function () {
      this.timeout(15000);
      await request
        .delete('/api/v1/product')
        .query({ productId: testProductId })
        .set('Authorization',authToken);

      const response = await request
        .get('/api/v1/products')
        .set('Authorization',authToken);

      expect(response.status).to.equal(404);
      expect(response.body).to.have.property('message').equal('No products found');
    });

    it('should return all products when fetching if products exist', async function () {

      this.timeout(25000);

      const images = [
        path.join(currentDir, 'images', 'img2.jpg'),
      ];

      const createProductResponse = await request
        .post('/api/v1/product')
        .set('Authorization', authToken)
        .field('name', 'Test Product 2')
        .field('real_price', 60.00)
        .field('qty', 15)
        .field('discounted_rate', 12.00)
        .attach('files', images[0]);

      const response = await request
        .get('/api/v1/products')
        .set('Authorization', authToken);

      expect(response.status).to.equal(200);
      expect(response.body).to.have.property('message').equal('Fetched All Products');
      expect(response.body).to.have.property('products').to.be.an('array');
      expect(response.body.products).to.have.lengthOf.above(0);
      expect(response.body.products[0]).to.have.property('seller').equal(null); // Seller details should be hidden
    });
  });

  describe('Get Products by Seller', () => {
    it('should return 404 when fetching products by a non-existent seller', async function () {
      this.timeout(15000);
      const response = await request
        .get('/api/v1/products/seller')
        .query({ sellerId: '6589bac5c7c0ab1ca35dd49x' })
        .set('Authorization', authToken);

      expect(response.status).to.equal(404);
      expect(response.body).to.have.property('message').equal('Seller does not exist');
    });

    it('should return products when fetching by a valid seller ID', async function () {
      const response = await request
        .get('/api/v1/products/seller')
        .query({ sellerId: sellerId })
        .set('Authorization', authToken);

      expect(response.status).to.equal(200);
      expect(response.body).to.have.property('message').equal("Fetched Specific Seller's Products");
      expect(response.body).to.have.property('products').to.be.an('array');
      expect(response.body.products[0]).to.have.property('seller').equal(null); // Seller details should be hidden
    });
  });

  after(async () => {
    await productModel.deleteMany({});
    await userModel.deleteMany({});
  });
});
