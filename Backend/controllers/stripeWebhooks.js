import stripe from "stripe";
import Booking from "../models/Booking.js";
import transporter from "../configs/nodemailer.js";
import "dotenv/config";

export const stripeWebhooks = async (request, response) => {
  const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY);
  const sig = request.headers["stripe-signature"];
  let event;

  try {
    event = stripeInstance.webhooks.constructEvent(
      request.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET,
    );
  } catch (error) {
    console.log("Webhook verification failed:", error.message);
    return response.status(400).send(`Webhook Error: ${error.message}`);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const { bookingId } = session.metadata;
    const paymentIntentId = session.payment_intent;

    try {
      const booking = await Booking.findById(bookingId).populate("hotel user");

      if (!booking.isPaid) {
        await Booking.findByIdAndUpdate(bookingId, {
          isPaid: true,
          paymentMethod: "Stripe",
          transactionId: paymentIntentId,
        });

        // ✉️ EMAIL: Backup Webhook Success Email
        try {
          if (booking.user && booking.user.email) {
            await transporter.sendMail({
              from: process.env.SENDER_EMAIL,
              to: booking.user.email,
              subject: `Payment Successful - ${booking.hotel.name}`,
              html: `<p>Payment of <b>₹${booking.totalPrice}</b> received successfully. Booking confirmed!</p>`,
            });
          }
        } catch (e) {
          console.log("Webhook Email Failed:", e.message);
        }

        console.log(`Booking ${bookingId} marked as paid via Webhook.`);
      }
    } catch (err) {
      console.error("Error updating booking via Webhook:", err);
    }
  }

  response.json({ received: true });
};
