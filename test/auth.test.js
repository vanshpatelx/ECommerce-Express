import supertest from 'supertest';
import app from '../src/server.js';
import userModel from '../src/models/user.Model.js';
import customerModel from '../src/models/customer.Model.js';
import sellerModel from '../src/models/seller.Model.js';
import { expect } from 'chai';

const request = supertest(app);

let registeredUserData;

describe('User Authentication Tests', () => {
    before(async function () {
        this.timeout(5000); // Retry the operation up to 3 times
        try {
            await userModel.deleteMany({});
            await customerModel.deleteMany({});
            await sellerModel.deleteMany({});
        } catch (error) {
            console.error("Error clearing user collection:", error);
            throw error;
        }
    });
    

    describe('User Registration', () => {
        let userDataCustomer, userDataSeller;

        beforeEach(() => {
            userDataCustomer = {
                email: 'test1@example.com',
                password: 'test123',
                type: 'Customer'
            };

            userDataSeller = {
                email: 'test2@example.com',
                password: 'seller123',
                type: 'Seller'
            };
        });

        const registerUser = async (userData) => {
            const res = await request
                .post('/api/v1/register')
                .send(userData);

            expect(res.status).to.equal(200);
            expect(res.body).to.have.property('message').equal('User registered successfully');
            expect(res.body).to.have.property('token');

            registeredUserData = userData;
        };

        it('should register a new customer user', async () => {
            await registerUser(userDataCustomer);
        });

        it('should register a new seller user', async () => {
            await registerUser(userDataSeller);
        });

        it('should handle duplicate email during registration', async () => {

            const res = await request
                .post('/api/v1/register')
                .send(userDataCustomer);

            expect(res.status).to.equal(400);
            expect(res.body).to.have.property('message').equal('Email is already registered');
        });

        it('should handle missing fields during registration', async () => {
            const incompleteUser = {
                password: 'test123',
                type: 'Customer'
            };

            const res = await request
                .post('/api/v1/register')
                .send(incompleteUser);

            expect(res.status).to.equal(400);
            expect(res.body).to.have.property('message').equal('Fill all fields');
        });
    });

    describe('User Login', () => {
        const loginUser = async (credentials) => {
            const res = await request
                .post('/api/v1/login')
                .send(credentials);

            expect(res.status).to.equal(200);
            expect(res.body).to.have.property('message').equal('User logged in successfully');
            expect(res.body).to.have.property('token');
        };

        it('should handle missing fields during login', async () => {
            const incompleteCredentials = {
                email: registeredUserData.email,
            };

            const res = await request
                .post('/api/v1/login')
                .send(incompleteCredentials);

            expect(res.status).to.equal(400);
            expect(res.body).to.have.property('message').equal('Fill all fields');
        });

        it('should login a registered user', async () => {
            await loginUser(registeredUserData);
        });

        it('should handle incorrect login credentials', async () => {
            const incorrectCredentials = {
                email: registeredUserData.email,
                password: 'wrongpassword'
            };

            const res = await request
                .post('/api/v1/login')
                .send(incorrectCredentials);

            expect(res.status).to.equal(401);
            expect(res.body).to.have.property('message').equal('Incorrect email or password.');
        });
    });

    after(async () => {
        try {
            // cleanup operations here
            await userModel.deleteMany({});
        } catch (error) {
            console.error("Error during cleanup:", error);
            throw error;
        }
    });
});
