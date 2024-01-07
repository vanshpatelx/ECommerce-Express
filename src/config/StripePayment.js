import { loadStripe } from '@stripe/stripe-js';

// Load the Stripe instance with the API key
const stripe = await loadStripe(process.env.StripeAPIKey);

// Function to create a charge
async function createCharge(token, amount, description) {
    try {
        const roundedAmount = Math.round(amount);

        // Use the loaded Stripe instance to create a charge
        const charge = await stripe.charges.create({
            amount: roundedAmount, // amount in cents
            currency: 'usd',
            source: token,
            description,
        });

        return charge;
    } catch (error) {
        throw error;
    }
}

// Export the createCharge function
export { createCharge };
