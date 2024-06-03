const fbAdmin = require('../config/firebase');
const postServices = require('./postServices');
const seedrandom = require('seedrandom');

const postsCollection = fbAdmin.db.collection('posts');
const usersCollection = fbAdmin.db.collection('users');
const postidsCollection = fbAdmin.db.collection('postids');

function seedShuffle(array, seed) {
    const rng = seedrandom(seed);
    let shuffledArray = array.slice(); // Create a copy of the array
    for (let i = shuffledArray.length - 1; i > 0; i--) {
        const j = Math.floor(rng() * (i + 1)); // Generate pseudo-random number
        [shuffledArray[i], shuffledArray[j]] = [shuffledArray[j], shuffledArray[i]]; // Swap elements
    }
    return shuffledArray;
}

async function randomPosts(userid, lastPostIndex = 0, limit = 9, seed = 123) {
    try {
        // Fetch user data and followings
        const userSnapshot = await usersCollection.doc(userid).get();
        const userData = userSnapshot.data();
        const followings = userData.followings.length === 0 ? ['placeholder'] : userData.followings;

        // Fetch post IDs
        let query = postidsCollection.where('userid', 'not-in', followings);
        const postidsSnapshot = await query.get();

        let postidsList = [];
        postidsSnapshot.forEach(doc => {
            const postidData = doc.data();
            if (postidData.userid !== userid) {
                postidsList.push(doc.id);
            }
        });

        const shuffledPostidsList = seedShuffle(postidsList, seed);
        const paginatedPostidsList = shuffledPostidsList.slice(lastPostIndex, lastPostIndex + limit);

        const posts = [];
        for (let postid of paginatedPostidsList) {
            const postSnapshot = await postsCollection.doc(postid).get();
            const postData = await postServices.processPostData(postSnapshot, false);
            posts.push(postData);
        }

        const newLastPostIndex = lastPostIndex + paginatedPostidsList.length;

        return { data: posts, lastIndex: newLastPostIndex };
    } catch (error) {
        console.error('Error getting posts', error);
        throw error;
    }
}

module.exports = {
    randomPosts,
};
