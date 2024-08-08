export async function transcribeAudio(audioFile) {
  try {
    const formData = new FormData();
    formData.append('audio', audioFile);

    const response = await fetch('/api/transcribe', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Transcription failed');
    }

    const data = await response.json();
    return data.transcription;
  } catch (error) {
    console.error('Error transcribing audio:', error);
    throw error;
  }
}

export async function getAIResponse(message, transcription) {
  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message, transcription }),
    });

    if (!response.ok) {
      throw new Error('AI response failed');
    }

    const data = await response.json();
    return data.response;
  } catch (error) {
    console.error('Error getting AI response:', error);
    throw error;
  }
}