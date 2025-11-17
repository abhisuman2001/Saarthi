// public/firebase-messaging-sw.js
importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyDU9Xbs54TlL13lDCjIcE-mZ5Q62FUNE6U",
  authDomain: "sarthi-ae251.firebaseapp.com",
  projectId: "sarthi-ae251",
  messagingSenderId: "397691991296",
  appId: "1:397691991296:web:c4981040deecd43709efe5",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(function(payload) {
  // payload.notification has title/body if sent as notification
  const notificationTitle = payload.notification?.title || 'Background Message';
  const notificationOptions = {
    body: payload.notification?.body || '',
    icon: '.\logo.jpg',
    data: payload.data // optional custom data
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
