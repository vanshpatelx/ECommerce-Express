const stripe = require('stripe')('sk_test_51OS2inJrvKl2JmmqXNTYOqQHLNAawVpCCge0dRnU2PthuQArmoMFTQ0UGYBnnoP4k23ayLY8rxdPAOJSGJowez2900TdAwotef');

function customRound(number, condition) {
    return condition ? Math.ceil(number) : Math.floor(number);
}

async function createCharge(token, amount, description) {
  try {
    const charge = await stripe.charges.create({
      amount: Number(customRound(amount, amount % 1 >= 0.5)), // amount in cents
      currency: 'usd',
      source: token,
      description: description,
    });

    return charge;
  } catch (error) {
    throw error;
  }
}

module.exports = {
  createCharge
};
