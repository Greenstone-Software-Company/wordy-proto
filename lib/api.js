export const transcribeAudio = async (audioUrl) => {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 2000));
  return "This is a simulated transcription of the audio.";
};

export const getAIResponse = async (message, context) => {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 1000));
  return "This is a simulated AI response to your message.";
};
