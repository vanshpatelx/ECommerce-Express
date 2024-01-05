const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../src/server'); // Update the path as needed
const userModel = require("../src/models/user.Model");
const sellerModel = require("../src/models/seller.Model");

chai.use(chaiHttp);
const expect = chai.expect;

let authToken; // Variable to store the JWT token for authentication

describe('Seller API Tests', () => {
    before(async () => {
        // Clear the user and seller collections in the test database
        await userModel.deleteMany({});
        await sellerModel.deleteMany({});

        // Register a user as a seller for testing
        const registerResponse = await chai
            .request(app)
            .post('/api/v1/register')
            .send({
                email: 'seller@gmail.com',
                password: 'seller123',
                type: 'Seller'
            });

        expect(registerResponse).to.have.status(200);
        expect(registerResponse.body).to.have.property('token');
        authToken = registerResponse.body.token;
    });

    describe('Add Seller', () => {
        it('should add a new seller for the authenticated user', async () => {
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
                .set('Authorization', authToken)
                .send(addSellerData);

            expect(addSellerResponse).to.have.status(200);
            expect(addSellerResponse.body).to.have.property('message').equal('Seller registered successfully');
        });

        it('should handle duplicate seller registration', async () => {
            const duplicateAddSellerData = {
                seller_address: {
                    street_name: '456 Oak St',
                    area: 'Uptown',
                    details: {
                        city: 'Citytown',
                        zip: 54321,
                        state: 'Stateville',
                        country: 'Countryland'
                    }
                },
                contact_info: {
                    num: {
                        contry_code: '+1',
                        number: '9876543210'
                    },
                    extra_num: {
                        contry_code: '+1',
                        number: '1234567890'
                    },
                    extra_email: 'extra@example.com'
                }
            };

            // Add the seller for the first time
            const firstAddSellerResponse = await chai
                .request(app)
                .post('/api/v1/seller')
                .set('Authorization', authToken)
                .send(duplicateAddSellerData);

            expect(firstAddSellerResponse).to.have.status(200);

            // Attempt to add the same seller again
            const duplicateAddSellerResponse = await chai
                .request(app)
                .post('/api/v1/seller')
                .set('Authorization', authToken)
                .send(duplicateAddSellerData);

            expect(duplicateAddSellerResponse).to.have.status(400);
            expect(duplicateAddSellerResponse.body).to.have.property('message').equal('Seller is already registered');
        });

        it('should handle missing fields during seller registration', async () => {
            const missingFieldsAddSellerData = {
                // Missing seller_address and contact_info
            };

            const missingFieldsAddSellerResponse = await chai
                .request(app)
                .post('/api/v1/seller')
                .set('Authorization', authToken)
                .send(missingFieldsAddSellerData);

            expect(missingFieldsAddSellerResponse).to.have.status(400);
            expect(missingFieldsAddSellerResponse.body).to.have.property('message').equal('Fill all fields in Seller registration');
        });

        it('should handle user type not being Seller', async () => {
            // Register a user as a customer for testing
            const registerResponse = await chai
                .request(app)
                .post('/api/v1/register')
                .send({
                    email: 'customer@gmail.com',
                    password: 'customer123',
                    type: 'Customer'
                });
        
            expect(registerResponse).to.have.status(200);
            expect(registerResponse.body).to.have.property('token');
            const customerAuthToken = registerResponse.body.token;
        
            const userTypeNotSellerData = {
                seller_address: {
                    street_name: '456 Oak St',
                    area: 'Uptown',
                    details: {
                        city: 'Citytown',
                        zip: 54321,
                        state: 'Stateville',
                        country: 'Countryland'
                    }
                },
                contact_info: {
                    num: {
                        contry_code: '+1',
                        number: '9876543210'
                    },
                    extra_num: {
                        contry_code: '+1',
                        number: '1234567890'
                    },
                    extra_email: 'extra@example.com'
                }
            };
        
            const userTypeNotSellerResponse = await chai
                .request(app)
                .post('/api/v1/seller')
                .set('Authorization', customerAuthToken)
                .send(userTypeNotSellerData);
        
            expect(userTypeNotSellerResponse).to.have.status(500);
            expect(userTypeNotSellerResponse.body).to.have.property('message').equal('Error in Registering Seller || User type is not Seller');
        });
        
    });

    describe('Update Seller', () => {
        it('should update the seller information for the authenticated user', async () => {
            const updateSellerData = {
                seller_address: {
                    street_name: '456 Oak St',
                    area: 'Uptown',
                    details: {
                        city: 'Citytown',
                        zip: 54321,
                        state: 'Stateville',
                        country: 'Countryland'
                    }
                },
                contact_info: {
                    num: {
                        contry_code: '+1',
                        number: '9876543210'
                    },
                    extra_num: {
                        contry_code: '+1',
                        number: '1234567890'
                    },
                    extra_email: 'extra@example.com'
                }
            };

            const updateSellerResponse = await chai
                .request(app)
                .patch('/api/v1/seller')
                .set('Authorization', authToken)
                .send(updateSellerData);

            expect(updateSellerResponse).to.have.status(200);
            expect(updateSellerResponse.body).to.have.property('message').equal('Seller updated successfully');
        });

        it('should handle missing fields during seller update', async () => {
            const missingFieldsUpdateSellerData = {
                // Missing seller_address and contact_info
            };

            const missingFieldsUpdateSellerResponse = await chai
                .request(app)
                .patch('/api/v1/seller')
                .set('Authorization', authToken)
                .send(missingFieldsUpdateSellerData);

            expect(missingFieldsUpdateSellerResponse).to.have.status(400);
            expect(missingFieldsUpdateSellerResponse.body).to.have.property('message').equal('Fill all fields in Seller registration');
        });

        it('should handle updating a user that is not registered as customer or seller', async () => {
            // Register a user without specifying the type (neither Customer nor Seller)
            const registerResponse = await chai
                .request(app)
                .post('/api/v1/register')
                .send({
                    email: 'registeredUser@gmail.com',
                    password: 'password123'
                });
        
            expect(registerResponse).to.have.status(200);
            expect(registerResponse.body).to.have.property('token');
            const registeredUserAuthToken = registerResponse.body.token;
        
            const updateUserNotRegisteredAsSellerData = {
                seller_address: {
                    street_name: '123 Main St',
                    area: 'Downtown',
                    details: {
                        city: 'Downtownville',
                        zip: 12345,
                        state: 'Downtownstate',
                        country: 'Downtownland'
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
        
            const updateUserNotRegisteredAsSellerResponse = await chai
                .request(app)
                .patch('/api/v1/seller')
                .set('Authorization', registeredUserAuthToken)
                .send(updateUserNotRegisteredAsSellerData);
        
            expect(updateUserNotRegisteredAsSellerResponse).to.have.status(400);
            expect(updateUserNotRegisteredAsSellerResponse.body).to.have.property('message').equal('Seller is not registered');
        });
        
        
    });

});
