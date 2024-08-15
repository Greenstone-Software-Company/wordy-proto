// pages/api/auth/google/callback.js
import { google } from 'googleapis';

export default async function handler(req, res) {
  const { code } = req.query;

  if (!code) {
    return res.status(400).json({ error: 'Missing authorization code' });
  }

  try {
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/google/callback`
    );

    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    // Here you would typically store the tokens in your database
    // associated with the user's account

    // Redirect to the dashboard with a success parameter
    res.redirect('/?googleCalendarConnected=true');
  } catch (error) {
    console.error('Error handling Google OAuth callback:', error);
    res.redirect('/?googleCalendarConnected=false');
  }
}