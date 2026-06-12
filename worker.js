const EMAIL_TO = 'ryan@rynodumps.com';
const EMAIL_FROM = 'RYNO Website <quotes@rynodumps.com>';

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === '/api/quote') {
      if (request.method !== 'POST') {
        return json({ error: 'Method not allowed' }, 405);
      }
      return handleQuote(request, env);
    }
    return env.ASSETS.fetch(request);
  },
};

async function handleQuote(request, env) {
  let data;
  try {
    data = await request.formData();
  } catch {
    return json({ error: 'Invalid form submission.' }, 400);
  }

  const field = (name, max) => (data.get(name) || '').toString().trim().slice(0, max);
  const name = field('name', 200);
  const email = field('email', 200);
  const size = field('size', 50);
  const message = field('message', 5000);

  // Honeypot: real users never fill this; pretend success for bots
  if (field('company', 200)) {
    return json({ ok: true });
  }

  if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return json({ error: 'Please provide your name and a valid email.' }, 400);
  }

  if (!env.RESEND_API_KEY) {
    return json({ error: 'Email service is not configured yet.' }, 503);
  }

  const page = request.headers.get('referer') || 'unknown';
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: EMAIL_FROM,
      to: [EMAIL_TO],
      reply_to: email,
      subject: `Quote Request - ${size || 'Dumpster Rental'}`,
      text: `Name: ${name}\nEmail: ${email}\nSize: ${size || 'Not selected'}\n\nProject Details:\n${message || '(none provided)'}\n\nSubmitted from: ${page}`,
    }),
  });

  if (!res.ok) {
    console.error('Resend error', res.status, await res.text());
    return json({ error: 'Failed to send your request. Please call or email us directly.' }, 502);
  }

  return json({ ok: true });
}

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
