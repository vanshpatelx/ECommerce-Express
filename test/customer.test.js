const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../src/server'); // Update the path as needed
const userModel = require("../src/models/user.Model");
const customerModel = require("../src/models/customer.Model");

chai.use(chaiHttp);
const expect = chai.expect;

let authToken; // Variable to store the JWT token for authentication

describe('Customer API Tests', () => {
    before(async () => {
        // Clear the user and customer collections in the test database
        await userModel.deleteMany({});
        await customerModel.deleteMany({});
        

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
        authToken = registerResponse.body.token;
    });

    describe('Add Customer', () => {
        it('should add a new customer for the authenticated user', async () => {
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
                .set('Authorization', authToken)
                .send(addCustomerData);

            expect(addCustomerResponse).to.have.status(200);
            expect(addCustomerResponse.body).to.have.property('message').equal('Customer registered successfully');
        });

        it('should handle duplicate customer registration', async () => {
            const duplicateAddCustomerData = {
                user_address: {
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

            // Add the customer for the first time
            const firstAddCustomerResponse = await chai
                .request(app)
                .post('/api/v1/customer')
                .set('Authorization', authToken)
                .send(duplicateAddCustomerData);

            expect(firstAddCustomerResponse).to.have.status(200);

            // Attempt to add the same customer again
            const duplicateAddCustomerResponse = await chai
                .request(app)
                .post('/api/v1/customer')
                .set('Authorization', authToken)
                .send(duplicateAddCustomerData);

            expect(duplicateAddCustomerResponse).to.have.status(400);
            expect(duplicateAddCustomerResponse.body).to.have.property('message').equal('Customer is already registered');
        });

        it('should handle missing fields during customer registration', async () => {
            const missingFieldsAddCustomerData = {
                // Missing user_address and contact_info
            };

            const missingFieldsAddCustomerResponse = await chai
                .request(app)
                .post('/api/v1/customer')
                .set('Authorization', authToken)
                .send(missingFieldsAddCustomerData);

            expect(missingFieldsAddCustomerResponse).to.have.status(400);
            expect(missingFieldsAddCustomerResponse.body).to.have.property('message').equal('Fill all fields in Customer registration');
        });

        it('should handle user type not being Customer', async () => {
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
            const sellerAuthToken = registerResponse.body.token;
        
            const userTypeNotCustomerData = {
                user_address: {
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
        
            const userTypeNotCustomerResponse = await chai
                .request(app)
                .post('/api/v1/customer')
                .set('Authorization', sellerAuthToken)
                .send(userTypeNotCustomerData);
        
            expect(userTypeNotCustomerResponse).to.have.status(500);
            expect(userTypeNotCustomerResponse.body).to.have.property('message').equal('Error in Registering Customer || User type is not customer');
        });
        
    });

    describe('Update Customer', () => {
        it('should update the customer information for the authenticated user', async () => {
            const updateCustomerData = {
                user_address: {
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

            const updateCustomerResponse = await chai
                .request(app)
                .patch('/api/v1/customer')
                .set('Authorization', authToken)
                .send(updateCustomerData);

            expect(updateCustomerResponse).to.have.status(200);
            expect(updateCustomerResponse.body).to.have.property('message').equal('Customer updated successfully');
        });

        it('should handle missing fields during customer update', async () => {
            const missingFieldsUpdateCustomerData = {
                // Missing user_address and contact_info
            };

            const missingFieldsUpdateCustomerResponse = await chai
                .request(app)
                .patch('/api/v1/customer')
                .set('Authorization', authToken)
                .send(missingFieldsUpdateCustomerData);

            expect(missingFieldsUpdateCustomerResponse).to.have.status(400);
            expect(missingFieldsUpdateCustomerResponse.body).to.have.property('message').equal('Fill all fields in Customer registration');
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
        
            const updateUserNotRegisteredAsCustomerData = {
                user_address: {
                    street_name: '789 Elm St',
                    area: 'Suburb',
                    details: {
                        city: 'Suburbville',
                        zip: 98765,
                        state: 'Suburbstate',
                        country: 'Suburbland'
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
        
            const updateUserNotRegisteredAsCustomerResponse = await chai
                .request(app)
                .patch('/api/v1/customer')
                .set('Authorization', registeredUserAuthToken)
                .send(updateUserNotRegisteredAsCustomerData);
        
            expect(updateUserNotRegisteredAsCustomerResponse).to.have.status(400);
            expect(updateUserNotRegisteredAsCustomerResponse.body).to.have.property('message').equal('Customer is not registered');
        });
        
    });
});