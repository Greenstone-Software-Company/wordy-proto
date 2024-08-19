import { auth } from '../../../firebase';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { idToken } = req.body;

  if (!idToken) {
    return res.status(400).json({ error: 'No ID token provided' });
  }

  try {
    // Verify the ID token
    const decodedToken = await auth.verifyIdToken(idToken);
    
    // Generate a custom token for the extension
    const customToken = await auth.createCustomToken(decodedToken.uid);

    res.status(200).json({ token: customToken });
  } catch (error) {
    console.error('Error creating custom token:', error);
    res.status(500).json({ error: 'Failed to create custom token' });
  }
}