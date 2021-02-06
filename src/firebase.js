import firebase from "firebase";

const firebaseConfig = {
  apiKey: "AIzaSyDoY31Ndq5rD5o-3B3R0VtX9CoiXXK61Ak",
  authDomain: "netflix-clone-3f5bf.firebaseapp.com",
  projectId: "netflix-clone-3f5bf",
  storageBucket: "netflix-clone-3f5bf.appspot.com",
  messagingSenderId: "380603406420",
  appId: "1:380603406420:web:5d42ccaeaf12df58edb5c1",
};

const firebaseApp = firebase.initializeApp(firebaseConfig);
const db = firebaseApp.firestore();
const auth = firebase.auth();

export { auth };
export default db;
