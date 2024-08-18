import { google } from 'googleapis';
import { setCookie } from 'nookies';

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/callback/google`
);

export default async function handler(req, res) {
  const { code } = req.query;

  if (!code) {
    return res.status(400).json({ error: 'Missing authorization code' });
  }

  try {
    const { tokens } = await oauth2Client.getToken(code);
    
    // Set a secure HTTP-only cookie with the access token
    setCookie({ res }, 'google_access_token', tokens.access_token, {
      maxAge: 3600, // 1 hour
      httpOnly: true,
      secure: process.env.NODE_ENV !== 'development',
      path: '/',
    });

    // Redirect to the dashboard
    res.redirect('/dashboard'); // Change this to the correct page
  } catch (error) {
    console.error('Error handling Google OAuth callback:', error);
    res.redirect('/?error=AuthenticationFailed');
  }
}
