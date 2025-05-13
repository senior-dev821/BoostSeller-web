// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
// import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  // apiKey: "AIzaSyA-JsXMHhXSzSvqGTwD73ZCeSQez65mQ0c",
  // authDomain: "boostseller-9721d.firebaseapp.com",
  // projectId: "boostseller-9721d",
  // storageBucket: "boostseller-9721d.firebasestorage.app",
  // messagingSenderId: "149742430838",
  // appId: "1:149742430838:web:e2dac97a6428dd0a0acd57",
	// measurementId: "G-9WTKMEJKYR"
	apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
	authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
	projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
	storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
	messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
	appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,

};

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);
const auth = getAuth(firebaseApp);
// const analytics = getAnalytics(app);
export { auth };
export default firebaseApp;