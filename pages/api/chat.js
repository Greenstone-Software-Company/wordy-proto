import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { message, transcription } = req.body;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: "You are a helpful assistant analyzing transcribed audio." },
        { role: "user", content: `Transcription: ${transcription}\n\nQuestion: ${message}` }
      ],
    });

    res.status(200).json({ response: completion.choices[0].message.content });
  } catch (error) {
    console.error('Error getting AI response:', error);
    res.status(500).json({ error: 'Error getting AI response' });
  }
}