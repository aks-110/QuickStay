import stripe from "stripe";
import Booking from "../models/Booking.js";
import "dotenv/config";

export const stripeWebhooks = async (request, response) => {
  // Stripe gateway Initialise
  const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY);

  const sig = request.headers["stripe-signature"];

  let event;

  try {
    event = stripeInstance.webhooks.constructEvent(
      request.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (error) {
    console.log("Webhook verification failed:", error.message);
    return response.status(400).send(`Webhook Error: ${error.message}`);
  }

  if (event.type === "checkout.session.completed") {
    // Note: usually for payment links it's checkout.session.completed,
    // but if you are using payment intents directly it might be payment_intent.succeeded.
    // Based on your frontend code (stripe.checkout.sessions.create),
    // the event is 'checkout.session.completed'.

    const session = event.data.object;

    // Metadata is directly available in the session object for checkout sessions
    const { bookingId } = session.metadata;

    try {
      // Mark Payment as paid
      await Booking.findByIdAndUpdate(bookingId, {
        isPaid: true,
        paymentMethod: "Stripe",
      });
      console.log(`Booking ${bookingId} marked as paid.`);
    } catch (err) {
      console.error("Error updating booking:", err);
    }
  } else {
    console.log("Unhandled event type:", event.type);
  }

  response.json({ received: true });
};
