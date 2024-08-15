import { google } from 'googleapis';

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/google/callback`
);

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: ['https://www.googleapis.com/auth/calendar.readonly'],
    });
    res.status(200).json({ authUrl });
  } else if (req.method === 'POST') {
    const { code } = req.body;
    try {
      const { tokens } = await oauth2Client.getToken(code);
      oauth2Client.setCredentials(tokens);

      const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
      const response = await calendar.events.list({
        calendarId: 'primary',
        timeMin: new Date().toISOString(),
        maxResults: 10,
        singleEvents: true,
        orderBy: 'startTime',
      });

      res.status(200).json({ events: response.data.items });
    } catch (error) {
      console.error('Error fetching Google Calendar events:', error);
      res.status(500).json({ error: 'Failed to fetch events' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}