import crypto from "crypto";

export default async function handler(req, res) {
  if (process.env.MODE !== "LIVE") {
    return res.status(403).end();
  }

  const signature = req.headers["x-cc-webhook-signature"];
  const payload = JSON.stringify(req.body);

  const expected = crypto
    .createHmac("sha256", process.env.COINBASE_WEBHOOK_SECRET)
    .update(payload)
    .digest("hex");

  if (signature !== expected) {
    return res.status(400).end();
  }

  const event = req.body.event;

  if (event?.type === "charge:confirmed") {
    const amount = event.data.pricing.local.amount;
    const id = event.data.id;

    if (process.env.DISCORD_WEBHOOK) {
      await fetch(process.env.DISCORD_WEBHOOK, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          embeds: [{
            title: "Crypto Payment Confirmed",
            fields: [
              { name: "Charge ID", value: id },
              { name: "Amount", value: `$${amount}` }
            ]
          }]
        })
      });
    }
  }

  res.status(200).end();
}
