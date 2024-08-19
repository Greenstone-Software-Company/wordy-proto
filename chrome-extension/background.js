// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCvGbIoSMRPLI4gLljlb_haiTEd5uq4Eo4",
    authDomain: "wordy-speech-to-text.firebaseapp.com",
    projectId: "wordy-speech-to-text",
    storageBucket: "wordy-speech-to-text.appspot.com",
    messagingSenderId: "944420963206",
    appId: "1:944420963206:web:a8a727cc9651f530fee207",
    measurementId: "G-5VE0BNBLM0"
  };
  
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);
  const auth = firebase.auth();
  const storage = firebase.storage();
  const db = firebase.firestore();
  
  let currentMeetingTab = null;
  let isRecording = false;
  let isListening = false;
  let recordingStartTime = null;
  
  chrome.runtime.onInstalled.addListener(() => {
    chrome.action.setBadgeText({ text: 'OFF' });
  });
  
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    switch (request.action) {
      case 'updateListeningStatus':
        isListening = request.isListening;
        updateExtensionStatus();
        break;
      case 'updateRecordingStatus':
        isRecording = request.isRecording;
        if (isRecording) {
          recordingStartTime = Date.now();
          chrome.action.setBadgeText({ text: 'REC' });
          chrome.action.setBadgeBackgroundColor({ color: '#FF0000' });
        } else {
          chrome.action.setBadgeText({ text: 'OFF' });
          chrome.action.setBadgeBackgroundColor({ color: '#808080' });
        }
        break;
      case 'startRecording':
        if (!isRecording) {
          isRecording = true;
          recordingStartTime = Date.now();
          chrome.action.setBadgeText({ text: 'REC' });
          chrome.action.setBadgeBackgroundColor({ color: '#FF0000' });
          chrome.tabs.sendMessage(currentMeetingTab, { action: 'startRecording' });
        }
        break;
      case 'stopRecording':
        if (isRecording) {
          isRecording = false;
          chrome.action.setBadgeText({ text: 'OFF' });
          chrome.action.setBadgeBackgroundColor({ color: '#808080' });
          chrome.tabs.sendMessage(currentMeetingTab, { action: 'stopRecording' });
        }
        break;
      case 'getStatus':
        sendResponse({ 
          isRecording: isRecording, 
          isListening: isListening,
          duration: isRecording ? Date.now() - recordingStartTime : 0 
        });
        break;
      case 'uploadAudio':
        uploadAudio(request.audioBlob)
          .then(response => sendResponse({ success: true, data: response }))
          .catch(error => sendResponse({ success: false, error: error.message }));
        return true;  // Indicates that the response is asynchronous
      case 'authenticate':
        authenticateUser()
          .then(() => sendResponse({ success: true }))
          .catch(error => sendResponse({ success: false, error: error.message }));
        return true;  // Indicates that the response is asynchronous
    }
    return true;
  });
  
  function updateExtensionStatus() {
    if (isListening) {
      chrome.action.setIcon({ path: "images/icon128.png" });
      chrome.action.setTitle({ title: "Listening to meeting" });
    } else {
      chrome.action.setIcon({ path: "images/icon128_gray.png" });
      chrome.action.setTitle({ title: "Not in a meeting" });
    }
  }
  
  function authenticateUser() {
    return new Promise((resolve, reject) => {
      chrome.identity.getAuthToken({ interactive: true }, function(token) {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          const credential = firebase.auth.GoogleAuthProvider.credential(null, token);
          firebase.auth().signInWithCredential(credential)
            .then((userCredential) => {
              resolve(userCredential.user);
            })
            .catch((error) => {
              reject(error);
            });
        }
      });
    });
  }
  
  async function uploadAudio(audioBlob) {
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('User not authenticated');
      }
  
      const fileName = `recording_${Date.now()}.webm`;
      const storageRef = storage.ref(`recordings/${user.uid}/${fileName}`);
      await storageRef.put(audioBlob);
      const downloadURL = await storageRef.getDownloadURL();
  
      const recordingDoc = await db.collection('recordings').add({
        userId: user.uid,
        fileName: fileName,
        url: downloadURL,
        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
        duration: isRecording ? Date.now() - recordingStartTime : 0,
        transcription: '' // This will be updated after transcription
      });
  
      return { recordingId: recordingDoc.id, url: downloadURL };
    } catch (error) {
      console.error('Error uploading audio:', error);
      throw error;
    }
  }
  
  chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && 
        (tab.url.includes('meet.google.com') || tab.url.includes('teams.microsoft.com'))) {
      currentMeetingTab = tabId;
      chrome.tabs.sendMessage(tabId, { action: 'checkForMeeting' });
    }
  });