import app from 'firebase/app';

import 'firebase/auth';
import 'firebase/database';
import 'firebase/storage';
import 'firebase/functions';
import firestore from 'firebase/firestore';
const config = {
  apiKey: "AIzaSyD4uTGS4A0Kyl6frk3fwfWPzb26shHYIUw",
  authDomain: "idea-jar-a8e8c.firebaseapp.com",
  projectId: "idea-jar-a8e8c",
  storageBucket: "idea-jar-a8e8c.appspot.com",
  messagingSenderId: "287832135370",
  appId: "1:287832135370:web:bcc8c0269f474968eac633",
  measurementId: "G-PXZKWHM65R"
};


class Firebase {
  constructor() {
    app.initializeApp(config);
    console.log(app)
    this.auth = app.auth();
    //this.db = app.database();
    this.firestore = app.firestore();
    this.storage = app.storage();
    this.functions = app.functions()
    this.firebase = app;
    var _this = this;
    //  if there is no one signed in then we create an anoymouse account for them 
    this.auth.onAuthStateChanged((user)=>{
      if(user){}
      else{
        console.log("attempting to sign in ")
        _this.auth.signInAnonymously().then((user)=>{
          console.log("yeeeeeet")
          console.log( "this is the user", user.user.uid);
          let firstLogin = user.additionalUserInfo.isNewUser
          _this.firstLogin = firstLogin;
        })
      }
    });
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

  createNewBoard = () => this.functions.httpsCallable("createBoard")

}

export default Firebase;