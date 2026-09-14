import twilio from "twilio";
import dotenv from "dotenv";

dotenv.config();

const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_FROM_NUMBER, OWNER_PHONE_NUMBER } =
  process.env;

const isConfigured =
  TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN && TWILIO_FROM_NUMBER && OWNER_PHONE_NUMBER;

const client = isConfigured ? twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN) : null;

/**
 * Texts the owner's phone when a new order comes in.
 * Never throws — a failed text should never stop an order from saving.
 * Returns true if the text was sent, false otherwise.
 */
export async function sendOrderAlert(order, items) {
  if (!isConfigured) {
    console.warn(
      "Twilio isn't configured (check TWILIO_* and OWNER_PHONE_NUMBER in .env) — skipping SMS."
    );
    return false;
  }

  const itemLines = items
    .map((item) => `${item.quantity}x ${item.recipe_name}`)
    .join(", ");

  const body =
    `New order #${order.id} — ₹${order.total_amount}\n` +
    `${itemLines}\n` +
    `From: ${order.customer_name} (${order.customer_phone})\n` +
    `Deliver to: ${order.delivery_address}` +
    (order.notes ? `\nNotes: ${order.notes}` : "");

  try {
    await client.messages.create({
      body,
      from: TWILIO_FROM_NUMBER,
      to: OWNER_PHONE_NUMBER,
    });
    return true;
  } catch (err) {
    console.error("Failed to send order SMS:", err.message);
    return false;
  }
}
