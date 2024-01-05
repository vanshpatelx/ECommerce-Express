const chai = require("chai");
const chaiHttp = require("chai-http");
const { exec } = require("child_process");

chai.use(chaiHttp);
const expect = chai.expect;

describe("Common Test Suite", () => {
  before(async () => {
    console.log("Running common setup...");
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

  it("Step 4: Run pre tests", async () => {
    await runTestFile("pre.test.js");
  });

  it("Step 5: Run product tests", async () => {
    await runTestFile("product.test.js");
  });

  it("Step 6: Run productView tests", async () => {
    await runTestFile("productView.test.js");
  });

  it("Step 7: Run wishlist tests", async () => {
    await runTestFile("wishlist.test.js");
  });

  it("Step 8: Run order tests", async () => {
    await runTestFile("order.test.js");
  });

  it("Step 9: Run inventory tests", async () => {
    await runTestFile("inventory.test.js");
  });

  it("Step 10: Run review tests", async () => {
    await runTestFile("review.test.js");
  });

  after(async () => {
    console.log("Running common teardown...");
  });
});

// Function to run a specific test file
function runTestFile(fileName) {
  return new Promise((resolve, reject) => {
    const child = exec(`mocha ${fileName}`, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error executing ${fileName}: ${error}`);
        reject(error);
      } else {
        console.log(stdout);
        console.error(stderr);
        resolve();
      }
    });

    child.on("exit", (code) => {
      if (code !== 0) {
        console.error(`${fileName} exited with code ${code}`);
        reject(`Test ${fileName} failed`);
      }
    });
  });
}
