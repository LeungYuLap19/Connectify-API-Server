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

async function getUser(userid) {
    try {
        const userRef = usersCollection.doc(userid);
        const userSnapshot = await userRef.get();
        if (!userSnapshot.exists) {
            throw new Error('User not found');
        }

        const userData = userSnapshot.data();
        delete userData.password;
        return {id: userRef.id, ...userData};
    } catch (error) {
        console.error('Error getting user:', error);
        throw error;
    }
}

async function toggleFollowUser(userid, followerid) {
    try {  
        const userRef = usersCollection.doc(userid);
        const followerRef = usersCollection.doc(followerid);
        const userSnapshot = await userRef.get();
        const followerSnapshot = await followerRef.get();

        if (!userSnapshot.exists || !followerSnapshot.exists) {
            throw new Error('User not found');
        }

        const userData = userSnapshot.data();
        const followerData = followerSnapshot.data();

        const userFollowerIndex = userData.followers.indexOf(followerid);
        const followerFollowingIndex = followerData.followings.indexOf(userid);

        let updatedFollowers;
        let updatedFollowings;
        if (userFollowerIndex === -1 && followerFollowingIndex === -1) {
            updatedFollowers = [...userData.followers, followerid];
            updatedFollowings = [...followerData.followings, userid];
        }
        else {
            updatedFollowers = [...userData.followers];
            updatedFollowings = [...followerData.followings];
            updatedFollowers.splice(userFollowerIndex, 1);
            updatedFollowings.splice(followerFollowingIndex, 1);
        }

        await userRef.update({ followers: updatedFollowers });
        await followerRef.update({ followings: updatedFollowings });

        return { updatedFollowers, updatedFollowings };
        
    } catch (error) {
        console.error('Error toggling follow:', error);
        throw error;
    }
}

module.exports = {
    searchUsernames,
    getUser,
    toggleFollowUser,
}