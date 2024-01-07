import supertest from 'supertest';
import app from '../src/server.js';
import userModel from '../src/models/user.Model.js';
import productModel from '../src/models/product.model.js';
import authModel from '../src/models/user.Model.js';
import { expect } from 'chai';
import sellerModel from '../src/models/seller.Model.js';
import path from 'path';

const currentModuleURL = new URL(import.meta.url);
const currentDir = path.dirname(currentModuleURL.pathname);

const request = supertest(app);

describe('Product Tests', () => {
  let authToken; // Store user authentication token here
  let productId;
  let extraSellerId;
  before(async function () {
    this.timeout(10000);
    await productModel.deleteMany({});
    await userModel.deleteMany({});
    await sellerModel.deleteMany({});

    // Register a user as a seller for testing
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

    const authResponse = await request
      .post('/api/v1/login')
      .send({
        email: 'seller@gmail.com',
        password: 'seller123'
      });

    expect(authResponse.status).to.equal(200);
    expect(authResponse.body).to.have.property('token');
    authToken = authResponse.body.token;
  });

  it('should create a new product with valid data and images', async function () {
    this.timeout(15000);
    const validProductData = {
      name: 'Test Product',
      real_price: 50.00,
      qty: 10,
      discounted_rate: 10.00,
    };

    const images = [
      path.join(currentDir, 'images', 'img1.jpg'),
      path.join(currentDir, 'images', 'img2.jpg'),
    ];

    const createProductResponse = await request
      .post('/api/v1/product')
      .set('Authorization', authToken)
      .field('name', validProductData.name)
      .field('real_price', validProductData.real_price)
      .field('qty', validProductData.qty)
      .field('discounted_rate', validProductData.discounted_rate)
      .attach('files', images[0])
      .attach('files', images[1]);

    expect(createProductResponse.status).to.equal(200);
    expect(createProductResponse.body).to.have.property('message').equal('Product added successfully');
    productId = createProductResponse.body.productId
  });

  it('should fail to create a product with missing fields', async function () {
    this.timeout(15000);
    const invalidProductData = {
      qty: 5,
      discounted_rate: 8.00,
    };

    const images = [
      path.join(currentDir, 'images', 'img1.jpg'),
    ];

    const createProductResponse = await request
      .post('/api/v1/product')
      .set('Authorization', authToken)
      .field('qty', invalidProductData.qty)
      .field('discounted_rate', invalidProductData.discounted_rate)
      .attach('files', images[0]);

    expect(createProductResponse.status).to.equal(400);
    expect(createProductResponse.body).to.have.property('message').equal('Fill all fields in Product Create');
  });

  it('should update an existing product with valid data and images', async function () {
    this.timeout(25000);
    // Assuming a product with name 'Test Product' already exists
    const existingProduct = await productModel.find({ name: 'Test Product' });

    const updatedProductData = {
      name: 'Updated Test Product',
      real_price: 60.00,
      qty: 15,
      discounted_rate: 12.00,
    };

    const images = [
      path.join(currentDir, 'images', 'uimg1.jpg'),
      path.join(currentDir, 'images', 'uimg2.jpg'),
    ];
    const updateProductResponse = await request
      .patch('/api/v1/product')
      .set('Authorization', authToken)
      .query({ productId: productId })
      .field('name', updatedProductData.name)
      .field('real_price', updatedProductData.real_price)
      .field('qty', updatedProductData.qty)
      .field('discounted_rate', updatedProductData.discounted_rate)
      .attach('files', images[0])
      .attach('files', images[1]);

    expect(updateProductResponse.status).to.equal(200);
    expect(updateProductResponse.body).to.have.property('message').equal('Product updated successfully');
    expect(updateProductResponse.body).to.have.property('updatedProduct');
  });

  it('should fail to update a product with invalid product ID', async function () {
    this.timeout(10000);
    const invalidProductData = {
      name: 'Invalid Product',
      real_price: 60.00,
      qty: 15,
      discounted_rate: 12.00,
    };


    const images = [
      path.join(currentDir, 'images', 'uimg1.jpg'),
      path.join(currentDir, 'images', 'uimg2.jpg'),
    ];

    const updateProductResponse = await request
      .patch('/api/v1/product')
      .set('Authorization', authToken)
      .query({ productId: '6589bac5c7c0ab1ca35dd491' })
      .field('name', invalidProductData.name)
      .field('real_price', invalidProductData.real_price)
      .field('qty', invalidProductData.qty)
      .field('discounted_rate', invalidProductData.discounted_rate)
      .attach('files', images[0]);

    expect(updateProductResponse.status).to.equal(404);
    expect(updateProductResponse.body).to.have.property('message').equal('Product not found');
  });

  it('should fail to update a product with unauthorized access', async function () {
    this.timeout(15000);
    const unauthorizedProductData = {
      name: 'Unauthorized Product',
      real_price: 60.00,
      qty: 15,
      discounted_rate: 12.00,
    };


    // Register a user as a seller for testing
    const registerResponse = await request
      .post('/api/v1/register')
      .send({
        email: 'seller2@gmail.com',
        password: 'seller123',
        type: 'Seller'
      });

    expect(registerResponse.status).to.equal(200);
    expect(registerResponse.body).to.have.property('token');
    const authToken2 = registerResponse.body.token;

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
      .set('Authorization', authToken2)
      .send(addSellerData);

    expect(addSellerResponse.status).to.equal(200);

    const seller = await authModel.findOne({ email: 'seller2@gmail.com' });
    extraSellerId = seller._id;
    const unauthorizedProduct = await productModel.create({
      image_urls: ['./images/img1.jpg'],
      name: unauthorizedProductData.name,
      real_price: unauthorizedProductData.real_price,
      qty: unauthorizedProductData.qty,
      discounted_rate: unauthorizedProductData.discounted_rate,
      seller: seller._id,
      reviews: [],
    });

    const images = [
      path.join(currentDir, 'images', 'uimg1.jpg'),
      path.join(currentDir, 'images', 'uimg2.jpg'),
    ];

    const updateProductResponse = await request
      .patch('/api/v1/product')
      .set('Authorization', authToken)
      .query({ productId: unauthorizedProduct._id.toString() })
      .field('name', 'Updated Unauthorized Product')
      .field('real_price', 70.00)
      .field('qty', 20)
      .field('discounted_rate', 15.00)
      .attach('files', images[1]);

    expect(updateProductResponse.status).to.equal(403);
    expect(updateProductResponse.body).to.have.property('message').equal('Unauthorized access to update product');
  });

  it('should delete a product with valid authorization and existing product', async function () {
    this.timeout(20000);

    // // Assuming a product with name 'Test Product' already exists
    // const existingProduct = await productModel.findOne({ _id:productId});

    // console.log(existingProduct);
    // // if (!existingProduct) {
    // //   // If the product doesn't exist, you might want to handle this case gracefully
    // //   this.skip();
    // // }

    const deleteProductResponse = await request
      .delete('/api/v1/product')
      .set('Authorization', authToken)
      .query({ productId: productId });

    expect(deleteProductResponse.status).to.equal(200);
    expect(deleteProductResponse.body).to.have.property('message').equal('Product and associated images deleted successfully');

    // Verify that the product no longer exists in the database
    const deletedProduct = await productModel.findById(productId);
    expect(deletedProduct).to.be.null;

    // Verify that the product is removed from the seller's inventory
    const seller = await authModel.findOne({ email: 'seller@gmail.com' });
    const sellerComp = await sellerModel.findOne({user_id : seller._id});
    const productInInventory = sellerComp.product_inventory.find(
      (product) => product.toString() === productId
    );
    expect(productInInventory).to.be.undefined;
  });

  it('should fail to delete a product with invalid product ID', async function () {
    this.timeout(10000);

    const deleteProductResponse = await request
      .delete('/api/v1/product')
      .set('Authorization', authToken)
      .query({ productId: '6589bac5c7c0ab1ca35dd491' });

    expect(deleteProductResponse.status).to.equal(404);
    expect(deleteProductResponse.body).to.have.property('message').equal('Product not found');
  });

  it('should fail to delete a product with unauthorized access', async function () {
    this.timeout(15000);

    // Create a product owned by another seller
    const unauthorizedProduct = await productModel.create({
      image_urls: ['./images/img1.jpg'],
      name: 'Unauthorized Product',
      real_price: 60.00,
      qty: 15,
      discounted_rate: 12.00,
      seller: extraSellerId,  // Replace with a valid seller ID
      reviews: [],
    });

    const deleteProductResponse = await request
      .delete('/api/v1/product')
      .set('Authorization', authToken)
      .query({ productId: unauthorizedProduct._id.toString() });

    expect(deleteProductResponse.status).to.equal(403);
    expect(deleteProductResponse.body).to.have.property('message').equal('Unauthorized access to update product');
  });

  after(async () => {
    // Clean up: delete all data from the test database after running product tests
    await productModel.deleteMany({});
    await userModel.deleteMany({});
    await sellerModel.deleteMany({});

  });
});
