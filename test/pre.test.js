const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../src/server'); // Update the path as needed
const userModel = require("../src/models/user.Model");
const sellerModel = require("../src/models/seller.Model");
const customerModel = require('../src/models/customer.Model');
const fs = require('fs');
const path = require('path');

chai.use(chaiHttp);
const expect = chai.expect;

let authTokenSeller;
let authTokenCustomer;

let sellerRegister, customerRegister, addSellerData, addCustomerData;

describe('Registering Customer and Seller', () => {
    before(async () => {
        // Delete the auth.json file if it exists
        const authFilePath = path.join(__dirname, 'data', 'auth.json');
        if (fs.existsSync(authFilePath)) {
            fs.unlinkSync(authFilePath);
        }

        // Clear collections in the test database
        await Promise.all([
            userModel.deleteMany({}),
            sellerModel.deleteMany({}),
            customerModel.deleteMany({})
        ]);
    });

    describe('Add Seller', () => {
        it('registering User for Seller', async () => {
            sellerRegister = {
                email: 'seller@gmail.com',
                password: 'seller123',
                type: 'Seller'
            }

            // Register a user as a seller
            const registerResponseSeller = await chai
                .request(app)
                .post('/api/v1/register')
                .send(sellerRegister);

            expect(registerResponseSeller).to.have.status(200);
            expect(registerResponseSeller.body).to.have.property('token');
            authTokenSeller = registerResponseSeller.body.token;
        });

        it('should add a new seller for the authenticated user', async () => {
            addSellerData = {
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
                .set('Authorization', authTokenSeller)
                .send(addSellerData);

            expect(addSellerResponse).to.have.status(200);
            expect(addSellerResponse.body).to.have.property('message').equal('Seller registered successfully');
        });
    });

    describe('Add Customer', () => {
        it('registering User for Customer', async () => {
            customerRegister = {
                email: 'customer@gmail.com',
                password: 'customer123',
                type: 'Customer'
            }

            // Register a user as a customer
            const registerResponseCustomer = await chai
                .request(app)
                .post('/api/v1/register')
                .send(customerRegister);

            expect(registerResponseCustomer).to.have.status(200);
            expect(registerResponseCustomer.body).to.have.property('token');
            authTokenCustomer = registerResponseCustomer.body.token;
        });

        it('should add a new customer for the authenticated user', async () => {
            addCustomerData = {
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
                .set('Authorization', authTokenCustomer)
                .send(addCustomerData);

            expect(addCustomerResponse).to.have.status(200);
            expect(addCustomerResponse.body).to.have.property('message').equal('Customer registered successfully');
        });
    });

    after(() => {
        // Create a data object for writing to auth.json
        const data = {
            sellerAuth: sellerRegister,
            customerAuth: customerRegister,
            sellerData: addSellerData,
            customerData: addCustomerData,
        };

        // Write the data to auth.json
        const authFilePath = path.join(__dirname, 'data', 'auth.json');
        fs.writeFileSync(authFilePath, JSON.stringify(data, null, 2));
    });
});
