// pages/api/google-auth-url.js
import { google } from 'googleapis';

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/google/callback`
);

const SCOPES = ['https://www.googleapis.com/auth/calendar.readonly'];

export default function handler(req, res) {
  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });

  res.status(200).json({ url });
}