const chai = require('chai');
const chaiHttp = require('chai-http');
const { exec } = require('child_process');
const app = require('../src/server'); // Assuming your app file is in the specified path
const userModel = require("../models/user.Model");

chai.use(chaiHttp);
const expect = chai.expect;

let registeredUserData; // Variable to store registered user data

describe('User Authentication Tests', () => {
    before(async () => {
        // You may want to clear the user collection in your database before running tests
        await userModel.deleteMany({});
    });

    describe('User Registration', () => {
        it('should register a new customer user', async () => {
            const userData = {
                email: 'test1@example.com',
                password: 'test123',
                type: 'Customer'
            };

            const res = await chai
                .request(app)
                .post('/api/v1/register')
                .send(userData);

            expect(res).to.have.status(200);
            expect(res.body).to.have.property('message').equal('User registered successfully');
            expect(res.body).to.have.property('token');

            // Store registered user data for later use
            registeredUserData = userData;
        });

        it('should register a new seller user', async () => {
            const userData = {
                email: 'test2@example.com',
                password: 'seller123',
                type: 'Seller'
            };

            const res = await chai
                .request(app)
                .post('/api/v1/register')
                .send(userData);

            expect(res).to.have.status(200);
            expect(res.body).to.have.property('message').equal('User registered successfully');
            expect(res.body).to.have.property('token');

            // Store registered user data for later use
            registeredUserData = userData;
        });

        it('should handle duplicate email during registration', async () => {
            const existingUser = {
                email: 'test1@example.com',
                password: 'test123',
                type: 'Customer'
            };

            await chai
                .request(app)
                .post('/api/v1/register')
                .send(existingUser);

            const res = await chai
                .request(app)
                .post('/api/v1/register')
                .send(existingUser);

            expect(res).to.have.status(400);
            expect(res.body).to.have.property('message').equal('Email is already registered');
        });

        it('should handle missing fields during registration', async () => {
            const incompleteUser = {
                password: 'test123',
                type: 'Customer'
            };

            const res = await chai
                .request(app)
                .post('/api/v1/register')
                .send(incompleteUser);

            expect(res).to.have.status(400);
            expect(res.body).to.have.property('message').equal('Fill all fields');
        });
    });

    describe('User Login', () => {
        it('should handle missing fields during login', async () => {
            const incompleteCredentials = {
                email: registeredUserData.email,
            };

            const res = await chai
                .request(app)
                .post('/api/v1/login')
                .send(incompleteCredentials);

            expect(res).to.have.status(400);
            expect(res.body).to.have.property('message').equal('Fill all fields');
        });

        it('should login a registered user', async () => {
            const res = await chai
                .request(app)
                .post('/api/v1/login')
                .send(registeredUserData);

            expect(res).to.have.status(200);
            expect(res.body).to.have.property('message').equal('User logged in successfully');
            expect(res.body).to.have.property('token');
        });

        it('should handle incorrect login credentials', async () => {
            const incorrectCredentials = {
                email: registeredUserData.email,
                password: 'wrongpassword'
            };

            const res = await chai
                .request(app)
                .post('/api/v1/login')
                .send(incorrectCredentials);

            expect(res).to.have.status(401);
            expect(res.body).to.have.property('message').equal('Incorrect email or password.');
        });
    });
});
