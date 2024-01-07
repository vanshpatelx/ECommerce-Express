import supertest from 'supertest';
import app from '../src/server.js';
import userModel from '../src/models/user.Model.js';
import customerModel from '../src/models/customer.Model.js';
import sellerModel from '../src/models/seller.Model.js';
import { expect } from 'chai';

const request = supertest(app);

let authToken; // Variable to store the JWT token for authentication

describe('Customer API Tests', () => {
  before(async function () {
    this.timeout(10000);
    // Clear the user, customer, and seller collections in the test database
    await clearTestDatabase();
    // Register a user as a customer for testing
    await registerCustomerForTesting();
  });

  async function clearTestDatabase() {
    await userModel.deleteMany({});
    await customerModel.deleteMany({});
    await sellerModel.deleteMany({});
  }

  async function registerCustomerForTesting() {
    const registerResponse = await request
      .post('/api/v1/register')
      .send({
        email: 'customer@gmail.com',
        password: 'customer123',
        type: 'Customer'
      });

    expect(registerResponse.status).to.equal(200);
    expect(registerResponse.body).to.have.property('token');
    authToken = registerResponse.body.token;
  }

  describe('Add Customer', () => {
    let commonAddCustomerData;

    beforeEach(() => {
      commonAddCustomerData = {
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
    });

    it('registers a new customer for the authenticated user', async () => {
      const { body, status } = await request
        .post('/api/v1/customer')
        .set('Authorization', authToken)
        .send(commonAddCustomerData);

      expect(status).to.equal(200);
      expect(body).to.have.property('message').equal('Customer registered successfully');
    });

    it('handles duplicate customer registration', async () => {
      // Add the customer for the first time
      await request
        .post('/api/v1/customer')
        .set('Authorization', authToken)
        .send(commonAddCustomerData);

      // Attempt to add the same customer again
      const { body, status } = await request
        .post('/api/v1/customer')
        .set('Authorization', authToken)
        .send(commonAddCustomerData);

      expect(status).to.equal(400);
      expect(body).to.have.property('message').equal('Customer is already registered');
    });

    it('handles missing fields during customer registration', async () => {
      const missingFieldsAddCustomerData = {
        // Missing user_address and contact_info
      };

      const { body, status } = await request
        .post('/api/v1/customer')
        .set('Authorization', authToken)
        .send(missingFieldsAddCustomerData);

      expect(status).to.equal(400);
      expect(body).to.have.property('message').equal('Fill all fields in Customer registration');
    });

    it('handles user type not being Customer', async () => {
      // Register a user as a seller for testing
      const registerResponse = await request
        .post('/api/v1/register')
        .send({
          email: 'seller@gmail.com',
          password: 'seller123',
          type: 'Seller'
        });

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

      const { body, status } = await request
        .post('/api/v1/customer')
        .set('Authorization', sellerAuthToken)
        .send(userTypeNotCustomerData);

      expect(status).to.equal(500);
      expect(body).to.have.property('message').equal('Error in Registering Customer || User type is not customer');
    });
  });

  describe('Update Customer', () => {
    let commonUpdateCustomerData;

    beforeEach(() => {
      commonUpdateCustomerData = {
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
    });

    it('updates the customer information for the authenticated user', async () => {
      const { body, status } = await request
        .patch('/api/v1/customer')
        .set('Authorization', authToken)
        .send(commonUpdateCustomerData);

      expect(status).to.equal(200);
      expect(body).to.have.property('message').equal('Customer updated successfully');
    });

    it('handles missing fields during customer update', async () => {
      const missingFieldsUpdateCustomerData = {
        // Missing user_address and contact_info
      };

      const { body, status } = await request
        .patch('/api/v1/customer')
        .set('Authorization', authToken)
        .send(missingFieldsUpdateCustomerData);

      expect(status).to.equal(400);
      expect(body).to.have.property('message').equal('Fill all fields in Customer registration');
    });

    it('handles updating a user that is not registered as a customer or seller', async () => {
      // Register a user without specifying the type (neither Customer nor Seller)
      const registerResponse = await request
        .post('/api/v1/register')
        .send({
          email: 'registeredUser@gmail.com',
          password: 'password123',
          type : 'Seller'
        });

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

      const { body, status } = await request
        .patch('/api/v1/customer')
        .set('Authorization', registeredUserAuthToken)
        .send(updateUserNotRegisteredAsCustomerData);

      expect(status).to.equal(400);
      expect(body).to.have.property('message').equal('Customer is not registered');
    });
  });

  after(async () => {
    // delete all data from the test database
    await clearTestDatabase();
  });
});
