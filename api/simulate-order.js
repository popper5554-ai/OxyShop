export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).end();
  }

  if (process.env.MODE !== "SHOWCASE") {
    return res.status(403).json({ error: "Not allowed" });
  }

  const { amount } = req.body;

  const orderID =
    "EDU-" + Math.random().toString(36).substring(2, 10).toUpperCase();

  if (process.env.DISCORD_WEBHOOK) {
    await fetch(process.env.DISCORD_WEBHOOK, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        embeds: [{
          title: "Showcase Order",
          fields: [
            { name: "Order ID", value: orderID },
            { name: "Amount", value: `$${amount}` }
          ]
        }]
      })
    });
  }

  res.status(200).json({ orderID });
}
