document.addEventListener('DOMContentLoaded', function() {
    const firebaseConfig = {
        apiKey: "AIzaSyCvGbIoSMRPLI4gLljlb_haiTEd5uq4Eo4",
        authDomain: "wordy-speech-to-text.firebaseapp.com",
        projectId: "wordy-speech-to-text",
        storageBucket: "wordy-speech-to-text.appspot.com",
        messagingSenderId: "944420963206",
        appId: "1:944420963206:web:a8a727cc9651f530fee207",
        measurementId: "G-5VE0BNBLM0"
    };

    firebase.initializeApp(firebaseConfig);

    const loginContainer = document.getElementById('loginContainer');
    const mainContainer = document.getElementById('mainContainer');
    const loginForm = document.getElementById('loginForm');
    const logoutButton = document.getElementById('logoutButton');
    const recordButton = document.getElementById('recordButton');
    const statusElement = document.getElementById('status');
    const loadingIndicator = document.getElementById('loadingIndicator');
    const recordingsList = document.getElementById('recordingsList');

    let isRecording = false;

    function showError(message) {
        const errorElement = document.createElement('p');
        errorElement.className = 'error-message';
        errorElement.textContent = message;
        loginContainer.insertBefore(errorElement, loginForm.nextSibling);
        setTimeout(() => errorElement.remove(), 3000);
    }

    function updateUI(user) {
        if (user) {
            loginContainer.classList.add('hidden');
            mainContainer.classList.remove('hidden');
            fetchRecentRecordings();
        } else {
            loginContainer.classList.remove('hidden');
            mainContainer.classList.add('hidden');
        }
    }

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        loadingIndicator.classList.remove('hidden');

        try {
            await firebase.auth().signInWithEmailAndPassword(email, password);
        } catch (error) {
            showError(error.message);
        } finally {
            loadingIndicator.classList.add('hidden');
        }
    });

    logoutButton.addEventListener('click', async () => {
        try {
            await firebase.auth().signOut();
        } catch (error) {
            console.error('Logout error:', error);
        }
    });

    recordButton.addEventListener('click', () => {
        isRecording = !isRecording;
        statusElement.textContent = isRecording ? 'Recording...' : 'Not in a meeting';
        recordButton.textContent = isRecording ? 'Stop Recording' : 'Start Recording';
        recordButton.classList.toggle('btn-danger', isRecording);

        chrome.runtime.sendMessage({ 
            action: isRecording ? 'startRecording' : 'stopRecording' 
        });
    });

    async function fetchRecentRecordings() {
        // This is a placeholder. In a real implementation, you would fetch this data from your Wordy API.
        const recordings = [
            { id: 1, name: 'Team Meeting', date: '2024-09-11' },
            { id: 2, name: 'Client Presentation', date: '2024-09-10' },
        ];

        recordingsList.innerHTML = '';
        recordings.forEach(recording => {
            const li = document.createElement('li');
            li.textContent = `${recording.name} - ${recording.date}`;
            recordingsList.appendChild(li);
        });
    }

    firebase.auth().onAuthStateChanged((user) => {
        updateUI(user);
        if (user) {
            console.log("User signed in:", user.email);
        }
    });
});