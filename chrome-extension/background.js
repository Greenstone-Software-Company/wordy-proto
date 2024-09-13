let isRecording = false;
let recorder = null;
let audioChunks = [];

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'startRecording') {
        startRecording();
    } else if (request.action === 'stopRecording') {
        stopRecording();
    }
});

function startRecording() {
    if (isRecording) return;

    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {action: "requestAudioStream"}, function(response) {
            if (response && response.stream) {
                recorder = new MediaRecorder(response.stream);
                
                recorder.ondataavailable = (event) => {
                    audioChunks.push(event.data);
                };

                recorder.onstop = () => {
                    const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
                    sendAudioToServer(audioBlob);
                    audioChunks = [];
                };

                recorder.start();
                isRecording = true;
                chrome.action.setBadgeText({text: 'REC'});
                chrome.action.setBadgeBackgroundColor({color: '#FF0000'});
            }
        });
    });
}

function stopRecording() {
    if (!isRecording) return;

    recorder.stop();
    isRecording = false;
    chrome.action.setBadgeText({text: ''});
}

function sendAudioToServer(audioBlob) {
    // Implement the logic to send the audio to your Wordy backend for processing
    // This is a placeholder function
    console.log('Sending audio to server for processing...');
    
    // You would typically use fetch or XMLHttpRequest here to send the audio file
    // to your server for transcription and analysis
}