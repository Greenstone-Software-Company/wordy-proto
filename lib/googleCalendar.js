export const getGoogleAuthUrl = async () => {
  const response = await fetch('/api/google-calendar');
  const data = await response.json();
  return data.authUrl;
};

export const getGoogleEvents = async (code) => {
  const response = await fetch('/api/google-calendar', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ code }),
  });
  const data = await response.json();
  return data.events;
};