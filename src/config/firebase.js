// firebase.js
const admin = require('firebase-admin');
var serviceAccount = require("./connectify-39af7-firebase-adminsdk-httsl-ab4456cfd9.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

module.exports = db;
