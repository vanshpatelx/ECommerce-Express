import chai from 'chai';
import chaiHttp from 'chai-http';
import app from '../src/server.js'; // Import your Express app
import mongoose from 'mongoose';

chai.use(chaiHttp);
const expect = chai.expect;


describe('Seller Inventory Tests', () => {
    let sellerAuthToken;
    let productId1;
    let productId2;
    let sellerId;

    before(async () => {
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

        // Add products to the seller's inventory
        const addProduct = async (productData) => {
            const productResponse = await chai
                .request(app)
                .post('/api/v1/products')
                .set('Authorization', `Bearer ${sellerAuthToken}`)
                .send(productData);

            expect(productResponse).to.have.status(200);
            return productResponse.body.product._id;
        };

        productId1 = await addProduct({
            image_urls: ['./images/img1.jpg'],
            name: 'Product 1',
            real_price: 20.99,
            qty: 50,
            discounted_rate: 10,
        });

        productId2 = await addProduct({
            image_urls: ['./images/img2.jpg'],
            name: 'Product 2',
            real_price: 15.99,
            qty: 30,
            discounted_rate: 5,
        });

        // Get the seller ID
        const seller = await sellerModel.findOne({ user_id: sellerLoginResponse.body.user._id });
        sellerId = seller.user_id;
    });

    it('should successfully get seller inventory', async () => {
        const getInventoryResponse = await chai
            .request(app)
            .get('/api/v1/seller/inventory')
            .set('Authorization', `Bearer ${sellerAuthToken}`);

        expect(getInventoryResponse).to.have.status(200);
        const { message, inventory } = getInventoryResponse.body;
        expect(message).to.equal('Seller inventory retrieved successfully');
        expect(inventory).to.be.an('array').with.length.at.least(2);
    });

    it('should handle empty inventory gracefully', async () => {
        // Clear the seller's inventory
        await mongoose.model('Seller').findOneAndUpdate(
            { user_id: sellerId },
            { $set: { product_inventory: [] } }
        );

        const getEmptyInventoryResponse = await chai
            .request(app)
            .get('/api/v1/seller/inventory')
            .set('Authorization', `Bearer ${sellerAuthToken}`);

        expect(getEmptyInventoryResponse).to.have.status(200);
        const { message, inventory } = getEmptyInventoryResponse.body;
        expect(message).to.equal('Seller inventory retrieved successfully');
        expect(inventory).to.be.an('array').that.is.empty;
    });

    it('should handle errors when getting seller inventory', async () => {
        const getInventoryWithErrorResponse = await chai
            .request(app)
            .get('/api/v1/seller/inventory')
            .set('Authorization', `Bearer ${sellerAuthToken}INVALID`);

        expect(getInventoryWithErrorResponse).to.have.status(500);
        const { message } = getInventoryWithErrorResponse.body;
        expect(message).to.equal('Error in Getting Seller Inventory');
    });

    it('should handle unauthorized access', async () => {
        const unauthorizedResponse = await chai
            .request(app)
            .get('/api/v1/seller/inventory');

        expect(unauthorizedResponse).to.have.status(401);
        const { message } = unauthorizedResponse.body;
        expect(message).to.equal('Unauthorized');
    });

    it('should handle invalid authentication token', async () => {
        const invalidTokenResponse = await chai
            .request(app)
            .get('/api/v1/seller/inventory')
            .set('Authorization', 'Bearer invalid_token');

        expect(invalidTokenResponse).to.have.status(401);
        const { message } = invalidTokenResponse.body;
        expect(message).to.equal('Invalid token');
    });

    after(async () => {
        // Cleanup: Remove the added products from the seller's inventory
        await productModel.deleteMany({});
        await userModel.deleteMany({});
        await customerModel.deleteMany({});
        await sellerModel.deleteMany({});
        await orderModel.deleteMany({});;
    });
});
