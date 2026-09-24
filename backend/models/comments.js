const pool = require('../config/db');

const createComment = async (user_id, post_id, comment_text) => {
    const insertResult = await pool.query(
        "INSERT INTO comments (user_id, post_id, comment_text) VALUES ($1, $2, $3) RETURNING *",
        [user_id, post_id, comment_text]
    );
    const newComment = insertResult.rows[0];

    const userResult = await pool.query(
        "SELECT COALESCE(username, 'User ' || user_id) AS username FROM users WHERE user_id = $1",
        [user_id]
    );
    newComment.username = userResult.rows[0]?.username || `User ${user_id}`;
    return newComment;
};

const findByPostId = async (post_id) => {
    const result = await pool.query(
        `SELECT comments.*, COALESCE(users.username, 'User ' || comments.user_id) AS username 
         FROM comments 
         JOIN users ON comments.user_id = users.user_id 
         WHERE post_id = $1 
         ORDER BY comments.created_at ASC`,
        [post_id]
    );
    return result.rows;
};

module.exports = {
    createComment,
    findByPostId
};