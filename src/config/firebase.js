// firebase.js
const admin = require('firebase-admin');
var serviceAccount = require("C:\\Users\\jimmy\\Desktop\\Learn React\\connectify-39af7-firebase-adminsdk-httsl-af382782a7.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: 'connectify-39af7.appspot.com',
});

const db = admin.firestore();
const storage = admin.storage().bucket();

module.exports = {
    db, 
    storage
};
