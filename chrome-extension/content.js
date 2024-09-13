let mediaRecorder;
let audioChunks = [];
let currentStream = null; // To store the audio stream

// Listen for messages from the extension's background or popup script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    switch (request.action) {
        case "requestAudioStream":
            handleAudioAccess(sendResponse);
            return true; // Indicates that the response is asynchronous
        case 'startRecording':
            startRecording();
            break;
        case 'stopRecording':
            stopRecording();
            break;
    }
});

// Function to handle audio access and return the stream
function handleAudioAccess(sendResponse) {
    if (currentStream) {
        // If the stream is already available, respond immediately
        sendResponse({ stream: currentStream });
    } else {
        // Request audio stream access
        navigator.mediaDevices.getUserMedia({ audio: true })
            .then(stream => {
                currentStream = stream; // Store the stream for future use
                sendResponse({ stream: stream });
            })
            .catch(error => {
                console.error("Error accessing media devices:", error);
                sendResponse({ error: error.message });
            });
    }
}

// Function to start recording audio
function startRecording() {
    if (!currentStream) {
        console.error("No audio stream available for recording.");
        return;
    }
    
    mediaRecorder = new MediaRecorder(currentStream);
    mediaRecorder.ondataavailable = event => {
        audioChunks.push(event.data);
    };
    mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
        chrome.runtime.sendMessage({ action: 'uploadAudio', audioBlob });
        audioChunks = [];
    };
    mediaRecorder.start();
}

// Function to stop recording audio
function stopRecording() {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
        mediaRecorder.stop();
        mediaRecorder.stream.getTracks().forEach(track => track.stop());
        currentStream = null; // Clear the stream after stopping
    }
}
