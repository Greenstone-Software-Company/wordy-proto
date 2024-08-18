import { google } from 'googleapis';
import { parseCookies } from 'nookies';

export default async function handler(req, res) {
  const cookies = parseCookies({ req });
  const accessToken = cookies.google_access_token;

  if (!accessToken) {
    return res.status(401).json({ error: 'Not authenticated with Google' });
  }

  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({ access_token: accessToken });

  const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

  try {
    const response = await calendar.events.list({
      calendarId: 'primary',
      timeMin: new Date().toISOString(),
      maxResults: 10,
      singleEvents: true,
      orderBy: 'startTime',
    });

    const events = response.data.items.map(event => ({
      id: event.id,
      title: event.summary,
      start: event.start.dateTime || event.start.date,
      end: event.end.dateTime || event.end.date,
      meetingLink: event.hangoutLink || '',
    }));

    res.status(200).json({ events });
  } catch (error) {
    console.error('Error fetching Google Calendar events:', error);
    if (error.response && error.response.status === 401) {
      res.status(401).json({ error: 'Authentication token expired' });
    } else {
      res.status(500).json({ error: 'Failed to fetch events' });
    }
  }
}
