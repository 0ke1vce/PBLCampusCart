const fetch = global.fetch || require('node-fetch');

const API_BASE = process.env.API_BASE || 'http://localhost:3000/api';

(async () => {
  try {
    console.log('1) Fetch restaurants');
    const r = await fetch(`${API_BASE}/restaurants`);
    const rest = await r.json();
    const restaurants = rest.restaurants || rest;
    if (!restaurants || restaurants.length === 0) {
      console.error('No restaurants available to attach ticket to.');
      process.exit(1);
    }
    const restaurantId = restaurants[0].restaurant_id || restaurants[0].id;
    console.log(' -> Using restaurant id:', restaurantId, 'name:', restaurants[0].restaurant_name || restaurants[0].name);

    const unique = Date.now();
    const studentEmail = `test_student_${unique}@example.com`;
    const password = 'password123';

    console.log('2) Registering test student:', studentEmail);
    const regResp = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: studentEmail, password, full_name: 'Test Student', user_type: 'student' })
    });
    const regJson = await regResp.json();
    console.log(' -> Register response status:', regResp.status, regJson.message || regJson.error || regJson);

    console.log('3) Logging in');
    const loginResp = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: studentEmail, password })
    });
    const loginJson = await loginResp.json();
    if (!loginResp.ok) {
      console.error('Login failed:', loginResp.status, loginJson);
      process.exit(1);
    }
    const token = loginJson.token;
    console.log(' -> Received token:', token);

    console.log('4) Creating support ticket attached to restaurant');
    const ticketBody = {
      order_id: null,
      restaurant_id: restaurantId,
      ticket_type: 'order_issue',
      subject: `Test complaint ${unique}`,
      description: 'This is an automated test complaint for debugging',
      priority: 'medium'
    };

    const ticketResp = await fetch(`${API_BASE}/support/tickets`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(ticketBody)
    });
    const ticketJson = await ticketResp.json();
    console.log(' -> Ticket create status:', ticketResp.status, ticketJson);

    // Call debug endpoint to fetch ticket details
    console.log('5) Fetching debug info for created ticket:', ticketJson.ticket_id);
    const dbg = await fetch(`${API_BASE}/support/debug/ticket/${ticketJson.ticket_id}`, { headers: { Authorization: `Bearer ${token}` } });
    const dbgJson = await dbg.json();
    console.log(' -> Debug endpoint response status:', dbg.status, dbgJson);

    console.log('Test script complete. Check above debug response for restaurant_complaints rows.');
  } catch (err) {
    console.error('Test script error:', err);
    process.exit(1);
  }
})();
