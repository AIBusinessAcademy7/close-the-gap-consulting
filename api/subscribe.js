api/subscribe.js export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, list } = req.body;

  if (!email || !list) {
    return res.status(400).json({ error: 'Email and list are required' });
  }

  const API_KEY = process.env.MAILCHIMP_API_KEY;
  const AUDIENCE_ID_ABA = process.env.MAILCHIMP_AUDIENCE_ABA;
  const AUDIENCE_ID_CTGC = process.env.MAILCHIMP_AUDIENCE_CTGC;

  if (!API_KEY || !AUDIENCE_ID_ABA || !AUDIENCE_ID_CTGC) {
    return res.status(500).json({ error: 'Missing environment variables' });
  }

  const audienceId = list === 'aba' ? AUDIENCE_ID_ABA : AUDIENCE_ID_CTGC;
  const dataCenter = API_KEY.split('-')[1];
  const url = `https://${dataCenter}.api.mailchimp.com/3.0/lists/${audienceId}/members`;

  const data = {
    email_address: email,
    status: 'pending',
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${Buffer.from(`anystring:${API_KEY}`).toString('base64')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (response.ok || response.status === 400) {
      return res.status(200).json({ success: true, message: 'Subscribed!' });
    }

    return res.status(response.status).json({ error: 'Subscription failed' });
  } catch (error) {
    return res.status(500).json({ error: 'Server error' });
  }
}
