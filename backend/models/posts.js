const pool = require('../config/db');

const createPost = async (userId, caption, imageUrl) => {
    const result = await pool.query(
        "SELECT add_post($1, $2, $3)",
        [userId, caption, imageUrl]
    );
    return result.rows[0];
};

const findAllPosts = async () => {
    const result = await pool.query(
        `SELECT posts.*, users.username, users.profile_img 
         FROM posts 
         JOIN users ON posts.user_id = users.user_id`
    );
    return result.rows;
};
module.exports = {
    createPost,findAllPosts
};