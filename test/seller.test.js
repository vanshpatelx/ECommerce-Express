import supertest from 'supertest';
import app from '../src/server.js'; // Update the path as needed
import userModel from '../src/models/user.Model.js';
import sellerModel from '../src/models/seller.Model.js';
import { expect } from 'chai';

const request = supertest(app);

let authToken; // Variable to store the JWT token for authentication

describe('Seller API Tests', () => {
    before(async function () {
        this.timeout(10000);
        // Clear the user and seller collections in the test database
        await clearTestDatabase();
        // Register a user as a seller for testing
        await registerSellerForTesting();
    });

    async function clearTestDatabase() {
        await userModel.deleteMany({});
        await sellerModel.deleteMany({});
    }

    async function registerSellerForTesting() {
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
    }

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

            const addSellerResponse = await request
                .post('/api/v1/seller')
                .set('Authorization', authToken)
                .send(addSellerData);

            expect(addSellerResponse.status).to.equal(200);
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

            // Attempt to add the same seller again
            const duplicateAddSellerResponse = await request
                .post('/api/v1/seller')
                .set('Authorization', authToken)
                .send(duplicateAddSellerData);

            expect(duplicateAddSellerResponse.status).to.equal(400);
            expect(duplicateAddSellerResponse.body).to.have.property('message').equal('Seller is already registered');
        });

        it('should handle missing fields during seller registration', async () => {
            const missingFieldsAddSellerData = {
                // Missing seller_address and contact_info
            };

            const missingFieldsAddSellerResponse = await request
                .post('/api/v1/seller')
                .set('Authorization', authToken)
                .send(missingFieldsAddSellerData);

            expect(missingFieldsAddSellerResponse.status).to.equal(400);
            expect(missingFieldsAddSellerResponse.body).to.have.property('message').equal('Fill all fields in Seller registration');
        });

        it('should handle user type not being Seller', async () => {
            // Register a user as a customer for testing
            const registerResponse = await request
                .post('/api/v1/register')
                .send({
                    email: 'customer@gmail.com',
                    password: 'customer123',
                    type: 'Customer'
                });

            expect(registerResponse.status).to.equal(200);
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

            const userTypeNotSellerResponse = await request
                .post('/api/v1/seller')
                .set('Authorization',customerAuthToken)
                .send(userTypeNotSellerData);

            expect(userTypeNotSellerResponse.status).to.equal(500);
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

            const updateSellerResponse = await request
                .patch('/api/v1/seller')
                .set('Authorization', authToken)
                .send(updateSellerData);

            expect(updateSellerResponse.status).to.equal(200);
            expect(updateSellerResponse.body).to.have.property('message').equal('Seller updated successfully');
        });

        it('should handle missing fields during seller update', async () => {
            const missingFieldsUpdateSellerData = {
                // Missing seller_address and contact_info
            };

            const missingFieldsUpdateSellerResponse = await request
                .patch('/api/v1/seller')
                .set('Authorization', authToken)
                .send(missingFieldsUpdateSellerData);

            expect(missingFieldsUpdateSellerResponse.status).to.equal(400);
            expect(missingFieldsUpdateSellerResponse.body).to.have.property('message').equal('Fill all fields in Seller registration');
        });

        it('should handle updating a user that is not registered as a customer', async () => {
            // Register a user without specifying the type Customer
            const registerResponse = await request
                .post('/api/v1/register')
                .send({
                    email: 'registeredUser@gmail.com',
                    password: 'password123',
                    type: 'Customer'
                });

            expect(registerResponse.status).to.equal(200);
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

            const updateUserNotRegisteredAsSellerResponse = await request
                .patch('/api/v1/seller')
                .set('Authorization', registeredUserAuthToken)
                .send(updateUserNotRegisteredAsSellerData);

            expect(updateUserNotRegisteredAsSellerResponse.status).to.equal(400);
            expect(updateUserNotRegisteredAsSellerResponse.body).to.have.property('message').equal('Seller is not registered');
        });
    });

    after(async () => {
        // Add any cleanup operations here
        await clearTestDatabase();
    });
});