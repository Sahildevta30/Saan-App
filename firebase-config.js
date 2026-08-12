const firebaseConfig = {
    apiKey: "AIzaSyDhXpwowPhfXdnBcXCHvtS2ZVYxpZNFfRM",
    authDomain: "saan-app-3f55a.firebaseapp.com",
    databaseURL: "https://saan-app-3f55a-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "saan-app-3f55a",
    storageBucket: "saan-app-3f55a.firebasestorage.app",
    messagingSenderId: "212508232863",
    appId: "1:212508232863:web:c2d5a1a5769f976aa926aa"
  };
  firebase.initializeApp(firebaseConfig);
  const auth = firebase.auth();
  const db = firebase.database();

  const NAME_MAP = {
    "sahil@saan.app": "Sahil",
    "ananya@saan.app": "Ananya"
  };

  /* ---------------- PUSH NOTIFICATIONS (FCM) ---------------- */
  const VAPID_KEY = "BEzJEPiOY1hxO5EWRoFioPvOLTGvnRPXTYEUFfeeQ4sfbdEsuFJ4rjJ5WZ40j51uoffHHZm5VAle3_82JOXRg1c";
  const PUSH_WORKER_URL = "https://saan-push.suryasahilsskg.workers.dev";

  async function registerPushToken(name){
    try{
      if(!('Notification' in window) || Notification.permission !== 'granted') return;
      const supported = await firebase.messaging.isSupported();
      if(!supported) return;
      const reg = await navigator.serviceWorker.ready;
      const messaging = firebase.messaging();
      const token = await messaging.getToken({ vapidKey: VAPID_KEY, serviceWorkerRegistration: reg });
      if(token){ db.ref('fcmTokens/' + name).set(token); }
    }catch(e){ /* ignore — best effort */ }
  }

  async function sendPush(toName, title, body){
    try{
      const snap = await db.ref('fcmTokens/' + toName).once('value');
      const token = snap.val();
      if(!token) return;
      await fetch(PUSH_WORKER_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: token, title: title, body: body })
      });
    }catch(e){ /* ignore — best effort */ }
  }
