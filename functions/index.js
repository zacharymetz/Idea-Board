
const { name } = require('faker');
const Avatar = require('avatar-builder');
const admin = require('firebase-admin');
admin.initializeApp();
const functions = require('firebase-functions');

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
exports.shareLink = functions.https.onRequest((request, response) => {
  //functions.logger.info("Hello logs!", {structuredData: true});
  response.send("<teapot />");
});

// works 
exports.createBoard = functions.https.onCall(async (data, context) => {
    // make sure they arent anonymous 
    if(context.auth.token.firebase.sign_in_provider == "anonymous")
        throw "Anonymous users can't create boards, sign up to create boards"
    // check the number of board this person has made 
    const userPrivateDataDoc = await admin.firestore().collection("user").doc(context.auth.uid).collection("data").doc("private").get();
    if(userPrivateDataDoc.data.boardCount >= 10)
        throw "This user has reached the maximum number of boards that they can create"

    
    // else we let them create the board and then add a boardCount to the user private data 
    const newBoard = await admin.firestore()
                            .collection("board")
                            .add({
                                title : data.title,
                                dateCreated : null,
                                creator : context.auth.uid,
                                colaborators : [context.auth.uid],
                                archived : false
                            });
    

    
    await admin.firestore().collection("user").doc(context.auth.uid).collection("data").doc("private").update({
        boardCount :  admin.firestore.FieldValue.increment(1)
    });


    return;
});






exports.archiveBoard = functions.https.onCall(async (data, context) => {
    // remove the board 
    const { boardID } = data;
    const board = await admin
    .firestore()
    .collection("board")
    .doc(boardID)
    .get()

    if(!board)  
        throw "Board Does not exists"

    // check the permissions 
    if(board.data.personal)
        throw "Cannot Archive a personla board";

    if(board.data.creator != context.auth.uid)
        throw "Need to be the creator of the board to archive the board";

    await admin
        .firestore()
        .collection("board")
        .doc(boardID)
        .update({
                archived : true
            })
    
    await admin.firestore().collection("user").doc(context.auth.uid).collection("data").doc("private").update({
        boardCount : firestore.FieldValue.increment(-1)
    });
    
    return;


    
});


exports.newUserCreated = functions.auth.user().onCreate(async (user) => {
    // create public info for the user 
    await admin
        .firestore()
        .collection("user")
        .doc(user.uid)
        .set({
            dateCreated : firestore.FieldValue.serverTimestamp(),
            userName : name.firstName()+" the " + name.jobTitle(),
            profileImage : ""
        });


    // create a private document for the user 
    await admin
        .firestore()
        .collection("user")
        .doc(user.uid)
        .collection("data")
        .doc("private")
        .set({
            boardCount : 0
        })
    

    // create a document to store information only we can see about the user 
    await admin
        .firestore()
        .collection("user")
        .doc(user.uid)
        .collection("data")
        .doc("apponly")
        .set({
            accountType : "beta"
        });
});


// // allow people to upload their own 
// exports.addEmoji = functions.https.onCall((data, context) => {

// });