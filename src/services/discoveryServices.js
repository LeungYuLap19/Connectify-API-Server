const fbAdmin = require('../config/firebase');
const postServices = require('./postServices');

const postsCollection = fbAdmin.db.collection('posts');
const usersCollection = fbAdmin.db.collection('users');
const postidsCollection = fbAdmin.db.collection('postids');

async function randomPosts(userid, lastPostIndex = 0, limit = 10) {
    try {
        const userSnapshot = await usersCollection.doc(userid).get();
        const userData = userSnapshot.data();
        const followings = userData.followings;

        let query = postidsCollection.where('userid', 'not-in', followings);
        const postidsSnapshot = await query.get();

        let postidsList = [];
        postidsSnapshot.forEach(doc => {
            const postidData = doc.data();
            if (postidData.userid !== userid) {
                postidsList.push(doc.id);
            }
        });
        const shuffledPostidsList = postidsList.sort(() => Math.random() - 0.5);
        const paginatedPostidsList = shuffledPostidsList.slice(lastPostIndex, lastPostIndex + limit);

        const posts = [];
        for (let postid of paginatedPostidsList) {
            const postSnapshot = await postsCollection.doc(postid).get();
            const postData = await postServices.processPostData(postSnapshot, true);
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
}