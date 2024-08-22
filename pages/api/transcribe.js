import { auth } from '../../firebaseAdmin';
import { db } from '../../firebase';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { recordingUrl } = req.body;

  if (!recordingUrl) {
    return res.status(400).json({ error: 'No recording URL provided' });
  }

  try {
    // Verify the Firebase ID token
    const idToken = req.headers.authorization?.split('Bearer ')[1];
    if (!idToken) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decodedToken = await auth.verifyIdToken(idToken);
    const userId = decodedToken.uid;

    // Fetch the audio file
    const response = await fetch(recordingUrl);
    const arrayBuffer = await response.arrayBuffer();
    const file = new File([arrayBuffer], 'audio.mp3', { type: 'audio/mpeg' });

    // Use OpenAI's Whisper API for transcription
    const transcriptionResponse = await openai.audio.transcriptions.create({
      file: file,
      model: "whisper-1",
    });

    const transcription = transcriptionResponse.text;

    res.status(200).json({ transcription });
  } catch (error) {
    console.error('Error transcribing audio:', error);
    res.status(500).json({ error: 'Error transcribing audio', details: error.message });
  }
}