let mediaRecorder;
let audioStream;
let isListening = false;

function startListening() {
  if (isListening) return;
  
  navigator.mediaDevices.getUserMedia({ audio: true })
    .then(stream => {
      audioStream = stream;
      isListening = true;
      try {
        chrome.runtime.sendMessage({ action: 'updateListeningStatus', isListening: true });
      } catch (e) {
        console.error('Failed to send message: Extension context may be invalidated');
      }
    })
    .catch(error => console.error('Error accessing microphone:', error));
}

function stopListening() {
  if (!isListening) return;
  
  if (audioStream) {
    audioStream.getTracks().forEach(track => track.stop());
  }
  audioStream = null;
  isListening = false;
  try {
    chrome.runtime.sendMessage({ action: 'updateListeningStatus', isListening: false });
  } catch (e) {
    console.error('Failed to send message: Extension context may be invalidated');
  }
}

function checkForMeeting() {
  const isInMeeting = document.querySelector('audio') || document.querySelector('video');
  if (isInMeeting && !isListening) {
    startListening();
  } else if (!isListening && isListening) {
    stopListening();
  }
}

function startRecording() {
  if (!audioStream) return;
  
  mediaRecorder = new MediaRecorder(audioStream);
  const audioChunks = [];
  
  mediaRecorder.ondataavailable = (event) => {
    audioChunks.push(event.data);
  };
  
  mediaRecorder.onstop = () => {
    const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
    try {
      chrome.runtime.sendMessage({ action: 'uploadAudio', audioBlob: audioBlob });
    } catch (e) {
      console.error('Failed to send audio: Extension context may be invalidated');
    }
  };
  
  mediaRecorder.start();
  try {
    chrome.runtime.sendMessage({ action: 'updateRecordingStatus', isRecording: true });
  } catch (e) {
    console.error('Failed to send message: Extension context may be invalidated');
  }
}

function stopRecording() {
  if (mediaRecorder && mediaRecorder.state !== 'inactive') {
    mediaRecorder.stop();
    try {
      chrome.runtime.sendMessage({ action: 'updateRecordingStatus', isRecording: false });
    } catch (e) {
      console.error('Failed to send message: Extension context may be invalidated');
    }
  }
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch (request.action) {
    case 'startRecording':
      startRecording();
      break;
    case 'stopRecording':
      stopRecording();
      break;
  }
});

// Use a more reliable method to check for meetings
const observer = new MutationObserver(checkForMeeting);
observer.observe(document.body, { childList: true, subtree: true });

// Initial check
checkForMeeting();