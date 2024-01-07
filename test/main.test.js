import Seller from '../src/models/seller.Model.js';
import Customer from '../src/models/customer.Model.js';
import Product from '../src/models/product.model.js';
import Order from '../src/models/order.Model.js';
import Auth from '../src/models/user.Model.js';
import connectDB from '../src/config/mongoDBConnect.js'; // Auto-Connected - For more view code files
import 'dotenv/config';

connectDB();

describe("Common Test Suite", function () {
  this.timeout(500000); // Set a timeout for the entire test suite

  before(async function () {
    console.log("Running common setup...");

    try {
      await deleteAllData();
    } catch (error) {
      console.error(`Error during common setup: ${error}`);
      throw error;
    }
  });

  // Trigger other test files with specific priorities
  it("Step 1: Run Auth tests", async () => {
    await runTestFile("auth.test.js");
  });

  it("Step 2: Run seller tests", async () => {
    await runTestFile("seller.test.js");
  });

  it("Step 3: Run customer tests", async () => {
    await runTestFile("customer.test.js");
  });

  it("Step 4: Run product tests", async () => {
    await runTestFile("product.test.js");
  });

  it("Step 5: Run productView tests", async () => {
    await runTestFile("productView.test.js");
  });



  after(async () => {
    console.log("Running common teardown...");
  });
});

// Function to run a specific test file
function runTestFile(fileName) {
  return new Promise(async (resolve, reject) => {
    try {
      // Instead of spawning a new Mocha process, require the test file directly
      await import(`./${fileName}`);
      resolve();
    } catch (error) {
      console.error(`Error executing ${fileName}: ${error}`);
      reject(error);
    }
  });
}

// Delete All data in each model
async function deleteAllData() {
  try {
    await Seller.deleteMany({});
    await Customer.deleteMany({});
    await Auth.deleteMany({});
    await Product.deleteMany({});
    await Order.deleteMany({});
  } catch (error) {
    console.error("Error deleting data:", error);
    throw error;
  }
}
