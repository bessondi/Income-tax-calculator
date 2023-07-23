import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: 'AIzaSyBk8OdaB5Ba0B7KltZOb_G_yU-HX1kjM9Q',
  authDomain: 'mobile-app-af614.firebaseapp.com',
  databaseURL: 'https://mobile-app-af614-default-rtdb.europe-west1.firebasedatabase.app',
  projectId: 'mobile-app-af614',
  storageBucket: 'mobile-app-af614.appspot.com',
  messagingSenderId: '664771229580',
  appId: '1:664771229580:web:29911b919cf34ff5aac8a9',
};

export const firebase = initializeApp(firebaseConfig);
export const firestoreDB = getFirestore(firebase);
export const auth = getAuth();
