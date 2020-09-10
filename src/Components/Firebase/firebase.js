import app from 'firebase/app';

import 'firebase/auth';
import 'firebase/database';
import 'firebase/storage';
import firestore from 'firebase/firestore';
const config = {
  apiKey: "AIzaSyCOnc8JWV45MtAO8MuX6zd10mn9-Tf3BH4",
  authDomain: "opportunityjournal-22f21.firebaseapp.com",
  databaseURL: "https://opportunityjournal-22f21.firebaseio.com",
  projectId: "opportunityjournal-22f21",
  storageBucket: "opportunityjournal-22f21.appspot.com",
  messagingSenderId: "787587876733",
  appId: "1:787587876733:web:6e4f69a7b947215ae06e14",
  measurementId: "G-W4REGZQFLK"
};


class Firebase {
  constructor() {
    app.initializeApp(config);
    //console.log(app)
    this.auth = app.auth();
    this.db = app.database();
    this.firestore = app.firestore();
    this.storage = app.storage();
    this.firebase = app;
  }

  // *** Auth API ***

  doCreateUserWithEmailAndPassword = (email, password) =>
    this.auth.createUserWithEmailAndPassword(email, password);

  doSignInWithEmailAndPassword = (email, password) =>
    this.auth.signInWithEmailAndPassword(email, password);

  doSignOut = () => this.auth.signOut();

  doPasswordReset = email => this.auth.sendPasswordResetEmail(email);

  doPasswordUpdate = password =>
    this.auth.currentUser.updatePassword(password);


  // *** User API ***

  user = uid => this.db.ref(`users/${uid}`);

  users = () => this.db.ref('users');

  clients = () => this.firestore.collection('clients');

}

export default Firebase;