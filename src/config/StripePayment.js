const stripe = require('stripe')('YOUR_STRIPE_SECRET_KEY');

async function createCharge(token, amount, description) {
  try {
    const charge = await stripe.charges.create({
      amount: amount * 100, // amount in cents
      currency: 'usd',
      source: token,
      description: description,
    });

    return charge;
  } catch (error) {
    throw error;
  }
}

// async function createOrder(orderDetails) {
//   try {
//     // Implement logic to create an order in your database or perform other actions
//     // You can use orderDetails to gather relevant information
//     // For now, let's just log the order details
//     console.log('Order created:', orderDetails);

//     return { success: true, message: 'Order created successfully' };
//   } catch (error) {
//     throw error;
//   }
// }

function handleWebhookEvent(req, res) {
  const sig = req.headers['stripe-signature'];

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.rawBody, sig, 'YOUR_STRIPE_ENDPOINT_SECRET');
  } catch (err) {
    console.error('Webhook Error:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object; // contains a Stripe PaymentIntent
      // Handle successful payment intent, you may want to create an order here
      console.log('PaymentIntent was successful!', paymentIntent);
      break;
    case 'payment_intent.payment_failed':
      const failedPaymentIntent = event.data.object; // contains a Stripe PaymentIntent
      // Handle failed payment intent
      console.log('PaymentIntent failed:', failedPaymentIntent);
      break;
    // Add more cases as needed for other events

    default:
      // Unexpected event type
      return res.status(400).end();
  }

  // Return a response to acknowledge receipt of the event
  res.json({ received: true });
}

module.exports = {
  createCharge,
  handleWebhookEvent
};
