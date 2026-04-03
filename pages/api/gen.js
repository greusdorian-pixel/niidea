export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();
  const { prompt } = req.body;
  try {
    const r = await fetch("https://flux-api3.p.rapidapi.com/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-rapidapi-host": "flux-api3.p.rapidapi.com",
        "x-rapidapi-key": "65fcc0ed0cmshdfd50b999985c14p124d59jsn7449621c3a2a",
      },
      body: JSON.stringify({ prompt }),
    });
    const data = await r.json();
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
