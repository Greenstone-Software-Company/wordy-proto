export const getGoogleAuthUrl = async () => {
  try {
    const response = await fetch('/api/google-auth-url');
    const data = await response.json();
    return data.url;
  } catch (error) {
    console.error('Error getting Google Auth URL:', error);
    throw new Error('Failed to get Google authentication URL');
  }
};

export const getGoogleEvents = async () => {
  try {
    const response = await fetch('/api/google-calendar');
    if (!response.ok) {
      if (response.status === 401) {
        // If unauthorized, we need to re-authenticate
        const authUrl = await getGoogleAuthUrl();
        window.location.href = authUrl;
        return [];
      }
      throw new Error('Failed to fetch Google Calendar events');
    }
    const data = await response.json();
    return data.events;
  } catch (error) {
    console.error('Error fetching Google Calendar events:', error);
    throw error;
  }
};
