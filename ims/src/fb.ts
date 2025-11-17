// firebase-messaging.js
import { getMessaging, getToken } from "firebase/messaging";
import { initializeApp } from "firebase/app";

// TODO: Replace the following with your app's Firebase project configuration
// See: https://firebase.google.com/docs/web/learn-more#config-object
const firebaseConfig = {
  apiKey: "AIzaSyDU9Xbs54TlL13lDCjIcE-mZ5Q62FUNE6U",
  authDomain: "sarthi-ae251.firebaseapp.com",
  projectId: "sarthi-ae251",
  storageBucket: "sarthi-ae251.firebasestorage.app",
  messagingSenderId: "397691991296",
  appId: "1:397691991296:web:c4981040deecd43709efe5",
  measurementId: "G-7PVBSDK150"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const requestFirebaseNotificationPermission = async () => {
  try {
    const messaging = getMessaging(app);
    const currentToken = await getToken(messaging, { vapidKey: 'BOH8CZAv2--_cvMnOtStPyHLdXuUoSeu1wnqSg8LpebIkHM1gyaKoPwAVsfyuZPT2h4-69xsI3PbRYpSBM-YdnU' });
    
    if (currentToken) {
      console.log('FCM registration token:', currentToken);
      // send token to your server for later push notifications
    } else {
      console.log('No registration token available. Request permission to generate one.');
    }
  } catch (err) {
    console.log('An error occurred while retrieving token. ', err);
  }
};
