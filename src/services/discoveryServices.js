const { firestore } = require('firebase-admin');
const fbAdmin = require('../config/firebase');
const postServices = require('./postServices');
const userServices = require('./userServices');

const postsCollection = fbAdmin.db.collection('posts');
const usersCollection = fbAdmin.db.collection('users');
const postidsCollection = fbAdmin.db.collection('postids');

// discoverPosts functions

async function discoverPosts(userid) {
    try {
        const userSnapshot = await usersCollection.doc(userid).get();
        const userData = userSnapshot.data();
        const followings = userData.followings || [];

        // Fetch post IDs excluding those by the user and their followings
        let postIDsQuery = postidsCollection
            .where('userid', 'not-in', [userid, ...followings]);

        const postIDsSnapshot = await postIDsQuery.get();

        if (postIDsSnapshot.empty) {
            console.log('No matching posts.');
            return [];
        }

        // Convert snapshot to array of post IDs
        const postIDs = postIDsSnapshot.docs.map(doc => doc.id);

        // Shuffle and select 4 random post IDs
        const shuffledPostIDs = shuffleArray(postIDs);
        const selectedPostIDs = shuffledPostIDs.slice(0, 4);

        // Fetch and process post data for the selected post IDs
        const postsData = await Promise.all(selectedPostIDs.map(async postID => {
            const postDoc = await postsCollection.doc(postID).get();
            return await postServices.processPostData(postDoc, true);
        }));

        return postsData;
    } catch (error) {
        console.error('Error getting posts', error);
        throw error;
    }
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

async function discoverUsers(userid) {
    try {
        const userSnapshot = await usersCollection.doc(userid).get();
        const userData = userSnapshot.data();
        const followings = userData.followings || [];

        let recommendedUserids = [];

        // If the user has followings, fetch recommended users based on followings
        if (followings.length > 0) {
            const recommendedUsers = await getRecommendedUsers(followings, userid, 3);
            recommendedUserids = Object.entries(recommendedUsers)
                .sort((a, b) => b[1] - a[1])
                .map(entry => entry[0]);
        }

        // If there are less than 10 recommended users, fetch additional users from the collection
        if (recommendedUserids.length < 3) {
            const remainingCount = 3 - recommendedUserids.length;
            const additionalUserDocs = recommendedUserids.length > 0
                ? await usersCollection.where(firestore.FieldPath.documentId(), 'not-in', recommendedUserids).limit(remainingCount).get()
                : await usersCollection.limit(remainingCount).get();            
            const additionalUserids = additionalUserDocs.docs.map(doc => doc.id);
            recommendedUserids.push(...additionalUserids);
        }

        // Fetch user data for recommended user IDs
        recommendedUserids = recommendedUserids.filter(id => !followings.includes(id) && id !== userid);
        const usersData = await Promise.all(recommendedUserids.map(async userid => await userServices.getUser(userid)));

        return usersData;
    } catch (error) {
        console.error('Error getting users', error);
        throw error;
    }
}

async function getRecommendedUsers(followings, userid, maxRecommendations) {
    let recommendedUsers = {};
    let count = 0;

    for (const following of followings) {
        if (count >= maxRecommendations) break;

        const followingUserSnapshot = await usersCollection.doc(following).get();
        const followingUserData = followingUserSnapshot.data();

        for (const following2 of followingUserData.followings || []) {
            if (followings.includes(following2) || following2 === userid) continue;

            recommendedUsers[following2] = (recommendedUsers[following2] || 0) + 1;
            count++;

            if (count >= maxRecommendations) break;
        }
    }

    return recommendedUsers;
}

module.exports = {
    discoverPosts,
    discoverUsers,
};
