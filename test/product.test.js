const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../src/server'); // Import your Express app
const { expect } = chai;

chai.use(chaiHttp);

// Include necessary models and functions
const sellerModel = require('../src/models/seller.Model');
const productModel = require('../src/models/product.model');
const { uploadImages, getImageUrls, deleteImage } = require('../src/config/ImageUpload');

describe('Product Tests', () => {
    let authToken; // Store user authentication token here

    // Run this block before tests to authenticate a user
    before(async () => {
        // Perform user authentication and get the token
        const authResponse = await chai
            .request(app)
            .post('/api/v1/login')
            .send({
                email: 'seller@gmail.com',
                password: 'seller123'
            });

        authToken = authResponse.body.token;
    });

    // // Cleanup created product after all tests
    // after(async () => {
    //     // Perform cleanup (delete the created product)
    //     // Replace the code below with your actual cleanup logic
    //     const seller = await sellerModel.findOne({ user_id: 'user@example.com' });
    //     const product = await productModel.findOne({ seller: seller._id, name: 'Test Product' });

    //     if (product) {
    //         await chai
    //             .request(app)
    //             .delete(`/api/v1/delete-product?productId=${product._id}`)
    //             .set('Authorization', `Bearer ${authToken}`);
    //     }
    // });
    it('should create a new product with valid data and images', async () => {
        const validProductData = {
            name: 'Test Product',
            real_price: 50.00,
            qty: 10,
            discounted_rate: 10.00,
        };

        const images = [
            'path/to/image1.jpg',
            'path/to/image2.jpg',
            'path/to/image3.jpg',
        ];

        const createProductResponse = await chai
            .request(app)
            .post('/api/v1/product')
            .set('Authorization', `Bearer ${authToken}`)
            .field('name', validProductData.name)
            .field('real_price', validProductData.real_price)
            .field('qty', validProductData.qty)
            .field('discounted_rate', validProductData.discounted_rate)
            .attach('files', images[0])
            .attach('files', images[1])
            .attach('files', images[2]);

        expect(createProductResponse).to.have.status(200);
        expect(createProductResponse.body).to.have.property('message').equal('Product added successfully');
        expect(createProductResponse.body).to.have.property('productId');
    });

    it('should fail to create a product with missing fields', async () => {
        const invalidProductData = {
            qty: 5,
            discounted_rate: 8.00,
        };

        const createProductResponse = await chai
            .request(app)
            .post('/api/v1/product')
            .set('Authorization', `Bearer ${authToken}`)
            .field('qty', invalidProductData.qty)
            .field('discounted_rate', invalidProductData.discounted_rate)
            .attach('files', 'path/to/image.jpg');

        expect(createProductResponse).to.have.status(400);
        expect(createProductResponse.body).to.have.property('message').equal('Fill all fields in Product Create');
    });

    it('should update an existing product with valid data and images', async () => {
        // Assuming a product with name 'Test Product' already exists
        const existingProduct = await productModel.findOne({ name: 'Test Product' });

        const updatedProductData = {
            name: 'Updated Test Product',
            real_price: 60.00,
            qty: 15,
            discounted_rate: 12.00,
        };

        const updatedImages = [
            'path/to/updated-image1.jpg',
            'path/to/updated-image2.jpg',
        ];

        const updateProductResponse = await chai
            .request(app)
            .patch('/api/v1/product')
            .set('Authorization', `Bearer ${authToken}`)
            .field('productId', existingProduct._id)
            .field('name', updatedProductData.name)
            .field('real_price', updatedProductData.real_price)
            .field('qty', updatedProductData.qty)
            .field('discounted_rate', updatedProductData.discounted_rate)
            .attach('files', updatedImages[0])
            .attach('files', updatedImages[1]);

        expect(updateProductResponse).to.have.status(200);
        expect(updateProductResponse.body).to.have.property('message').equal('Product updated successfully');
        expect(updateProductResponse.body).to.have.property('updatedProduct');
    });

    it('should fail to update a product with invalid product ID', async () => {
        const invalidProductData = {
            name: 'Invalid Product',
            real_price: 60.00,
            qty: 15,
            discounted_rate: 12.00,
        };

        const updateProductResponse = await chai
            .request(app)
            .patch('/api/v1/product')
            .set('Authorization', `Bearer ${authToken}`)
            .field('productId', 'invalidProductId')
            .field('name', invalidProductData.name)
            .field('real_price', invalidProductData.real_price)
            .field('qty', invalidProductData.qty)
            .field('discounted_rate', invalidProductData.discounted_rate)
            .attach('files', 'path/to/updated-image.jpg');

        expect(updateProductResponse).to.have.status(404);
        expect(updateProductResponse.body).to.have.property('message').equal('Product not found');
    });

    it('should fail to update a product with unauthorized access', async () => {
        const unauthorizedProductData = {
            name: 'Unauthorized Product',
            real_price: 60.00,
            qty: 15,
            discounted_rate: 12.00,
        };

        const unauthorizedProduct = await productModel.create({
            image_urls: ['path/to/image.jpg'],
            name: unauthorizedProductData.name,
            real_price: unauthorizedProductData.real_price,
            qty: unauthorizedProductData.qty,
            discounted_rate: unauthorizedProductData.discounted_rate,
            seller: 'unauthorizedSellerId', // Use a different seller ID
            reviews: [],
        });

        const updateProductResponse = await chai
            .request(app)
            .patch('/api/v1/product')
            .set('Authorization', `Bearer ${authToken}`)
            .field('productId', unauthorizedProduct._id)
            .field('name', 'Updated Unauthorized Product')
            .field('real_price', 70.00)
            .field('qty', 20)
            .field('discounted_rate', 15.00)
            .attach('files', 'path/to/updated-image.jpg');

        expect(updateProductResponse).to.have.status(403);
        expect(updateProductResponse.body).to.have.property('message').equal('Unauthorized access to update product');
    });

});
