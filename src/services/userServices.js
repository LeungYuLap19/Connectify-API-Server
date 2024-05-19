const fuzzysort = require('fuzzysort');
const fbAdmin = require('../config/firebase');
const usersCollection = fbAdmin.db.collection('users');

async function searchUsernames(input) {
    try {
        const querySnapshot = await usersCollection.get();
        const users = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        const results = fuzzysort.go(input, users, { key: 'username' });

        const searchResults = [];
        results.map(result => {
            delete result.obj.password;
            searchResults.push(result.obj);
        });
        return searchResults;
    } catch (error) {
        console.error('Error searching usernames:', error);
        throw error;
    }
}

module.exports = {
    searchUsernames,
}