document.addEventListener('DOMContentLoaded', function() {
    const startButton = document.getElementById('startRecording');
    const stopButton = document.getElementById('stopRecording');
    const statusElement = document.getElementById('status');
    const recordingInfo = document.getElementById('recordingInfo');
    const recordingDuration = document.getElementById('recordingDuration');
    const loginButton = document.getElementById('login');
    const logoutButton = document.getElementById('logout');

    let recordingInterval;
    let isAuthenticated = false;

    function updateStatus(isRecording, isListening) {
        startButton.style.display = isRecording ? 'none' : 'inline-block';
        stopButton.style.display = isRecording ? 'inline-block' : 'none';
        recordingInfo.style.display = isRecording ? 'block' : 'none';
        statusElement.textContent = isListening ? 
            (isRecording ? 'Recording in progress' : 'Listening to meeting') : 
            'Not in a meeting';
        startButton.disabled = !isListening || !isAuthenticated;
    }

    function formatDuration(ms) {
        const seconds = Math.floor(ms / 1000);
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }

    function updateRecordingDuration(startTime) {
        recordingInterval = setInterval(() => {
            const duration = Date.now() - startTime;
            recordingDuration.textContent = formatDuration(duration);
        }, 1000);
    }

    function stopRecordingDuration() {
        clearInterval(recordingInterval);
    }

    function updateAuthStatus(authStatus) {
        isAuthenticated = authStatus;
        loginButton.style.display = authStatus ? 'none' : 'inline-block';
        logoutButton.style.display = authStatus ? 'inline-block' : 'none';
        startButton.disabled = !isAuthenticated;
    }

    startButton.addEventListener('click', () => {
        if (!isAuthenticated) return;
        chrome.runtime.sendMessage({ action: 'startRecording' });
    });

    stopButton.addEventListener('click', () => {
        chrome.runtime.sendMessage({ action: 'stopRecording' });
    });

    loginButton.addEventListener('click', () => {
        chrome.runtime.sendMessage({ action: 'authenticate' }, (response) => {
            if (response.success) {
                updateAuthStatus(true);
            } else {
                console.error('Authentication failed:', response.error);
            }
        });
    });

    logoutButton.addEventListener('click', () => {
        // Implement logout functionality
        updateAuthStatus(false);
    });

    chrome.runtime.sendMessage({ action: 'getStatus' }, (response) => {
        updateStatus(response.isRecording, response.isListening);
        if (response.isRecording) {
            updateRecordingDuration(Date.now() - response.duration);
        }
    });

    // Check initial auth status
    chrome.storage.local.get('isAuthenticated', (result) => {
        updateAuthStatus(result.isAuthenticated || false);
    });
});