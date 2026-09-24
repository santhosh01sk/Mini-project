const pool = require('./../config/db');

exports.getUsersOverview = async (req, res) => {
  try {
    const summaryQuery = `
      SELECT 
        (SELECT COUNT(*) FROM users)::int AS total_users,
        (SELECT COUNT(*) FROM posts)::int AS total_posts,
        (SELECT COUNT(*) FROM likes)::int AS total_likes,
        (SELECT COUNT(*) FROM comments)::int AS total_comments,
        (SELECT COUNT(*) / 2 FROM friends)::int AS total_friendships;
    `;

    const usersQuery = `
      SELECT 
        u.user_id,
        COALESCE(u.username, 'User ' || u.user_id) AS username,
        u.email,
        u.profile_img,
        u.created_at,
        (SELECT COUNT(*) FROM posts p WHERE p.user_id = u.user_id)::int AS post_count,
        (SELECT COUNT(*) FROM likes l JOIN posts p ON l.post_id = p.id WHERE p.user_id = u.user_id)::int AS total_post_likes,
        (SELECT COUNT(*) FROM comments c WHERE c.user_id = u.user_id)::int AS comment_count,
        (SELECT COUNT(*) FROM comments c JOIN posts p ON c.post_id = p.id WHERE p.user_id = u.user_id)::int AS comments_received,
        (SELECT COUNT(*) FROM friends f WHERE f.user_id = u.user_id)::int AS friend_count,
        COALESCE(
          (SELECT json_agg(
            json_build_object(
              'user_id', f_u.user_id,
              'username', COALESCE(f_u.username, 'User ' || f_u.user_id),
              'email', f_u.email,
              'profile_img', f_u.profile_img
            )
          )
          FROM friends f 
          JOIN users f_u ON f.friend_id = f_u.user_id 
          WHERE f.user_id = u.user_id),
          '[]'::json
        ) AS friends
      FROM users u
      ORDER BY u.user_id ASC;
    `;

    const [summaryResult, usersResult] = await Promise.all([
      pool.query(summaryQuery),
      pool.query(usersQuery)
    ]);

    res.json({
      summary: summaryResult.rows[0] || {
        total_users: 0,
        total_posts: 0,
        total_likes: 0,
        total_comments: 0,
        total_friendships: 0
      },
      users: usersResult.rows
    });
  } catch (error) {
    console.error('Error fetching admin users overview:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.getSystemLogs = async (req, res) => {
  try {
    const logsQuery = `
      (
        SELECT 
          'REGISTRATION' AS type,
          u.user_id,
          COALESCE(u.username, 'User ' || u.user_id) AS actor,
          u.email,
          'User registered on Mini Social' AS details,
          u.created_at
        FROM users u
      )
      UNION ALL
      (
        SELECT 
          'POST' AS type,
          p.user_id,
          COALESCE(u.username, 'User ' || u.user_id) AS actor,
          u.email,
          ('Created post: "' || SUBSTRING(COALESCE(NULLIF(p.caption, ''), '(photo post)'), 1, 60) || '"') AS details,
          p.created_at
        FROM posts p
        JOIN users u ON p.user_id = u.user_id
      )
      UNION ALL
      (
        SELECT 
          'COMMENT' AS type,
          c.user_id,
          COALESCE(u.username, 'User ' || u.user_id) AS actor,
          u.email,
          ('Commented on post #' || c.post_id || ': "' || SUBSTRING(c.comment_text, 1, 60) || '"') AS details,
          c.created_at
        FROM comments c
        JOIN users u ON c.user_id = u.user_id
      )
      UNION ALL
      (
        SELECT 
          'LIKE' AS type,
          l.user_id,
          COALESCE(u.username, 'User ' || u.user_id) AS actor,
          u.email,
          ('Liked post #' || l.post_id || ' by ' || COALESCE(pu.username, 'User ' || p.user_id)) AS details,
          l.created_at
        FROM likes l
        JOIN users u ON l.user_id = u.user_id
        JOIN posts p ON l.post_id = p.id
        JOIN users pu ON p.user_id = pu.user_id
      )
      UNION ALL
      (
        SELECT 
          'FRIEND_REQUEST' AS type,
          fr.sender_id AS user_id,
          COALESCE(su.username, 'User ' || fr.sender_id) AS actor,
          su.email,
          ('Friend request to ' || COALESCE(ru.username, 'User ' || fr.receiver_id) || ' [' || fr.status || ']') AS details,
          fr.created_at
        FROM friend_requests fr
        JOIN users su ON fr.sender_id = su.user_id
        JOIN users ru ON fr.receiver_id = ru.user_id
      )
      UNION ALL
      (
        SELECT 
          'MESSAGE' AS type,
          m.sender_id AS user_id,
          COALESCE(su.username, 'User ' || m.sender_id) AS actor,
          su.email,
          ('Sent message to ' || COALESCE(ru.username, 'User ' || m.receiver_id)) AS details,
          m.created_at
        FROM messages m
        JOIN users su ON m.sender_id = su.user_id
        JOIN users ru ON m.receiver_id = ru.user_id
      )
      ORDER BY created_at DESC
      LIMIT 250;
    `;

    const result = await pool.query(logsQuery);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching system logs:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.handleQuery = async (req, res) => {
  const { query } = req.body;
  if (!query) {
    return res.status(400).json({ error: 'Query parameter is required' });
  }

  let sqlQuery;
  let params = [];

  const lowerQuery = query.toLowerCase();

  if (lowerQuery.includes('get the details of user')) {
    const match = query.match(/details of user (\w+)/i);
    if (!match) return res.status(400).json({ error: 'Invalid user format in query' });
    const username = match[1];
    sqlQuery = `SELECT * FROM users WHERE username = $1`;
    params = [username];
  } 
  else if (lowerQuery.includes('details of users where month is greater than')) {
    const month = query.match(/details of users where month is greater than (\w+) (\d+)/i);
    if (!month) return res.status(400).json({ error: 'Invalid query format' });
    const monthName = month[1];
    const year = month[2];
    const monthNumber = new Date(`${monthName} 1, ${year}`).getMonth() + 1;
    sqlQuery = `SELECT * FROM users WHERE EXTRACT(MONTH FROM created_at) > $1 AND EXTRACT(YEAR FROM created_at) = $2`;
    params = [monthNumber, year];
  } else if (lowerQuery.includes('details of users where month is lesser than')) {
    const month = query.match(/details of users where month is lesser than (\w+) (\d+)/i);
    if (!month) return res.status(400).json({ error: 'Invalid query format' });
    const monthName = month[1];
    const year = month[2];
    const monthNumber = new Date(`${monthName} 1, ${year}`).getMonth() + 1;
    sqlQuery = `SELECT * FROM users WHERE EXTRACT(MONTH FROM created_at) < $1 AND EXTRACT(YEAR FROM created_at) = $2`;
    params = [monthNumber, year];
  } else if (lowerQuery.includes('details of users where month is equal to')) {
    const month = query.match(/details of users where month is equal to (\w+) (\d+)/i);
    if (!month) return res.status(400).json({ error: 'Invalid query format' });
    const monthName = month[1];
    const year = month[2];
    const monthNumber = new Date(`${monthName} 1, ${year}`).getMonth() + 1;
    sqlQuery = `SELECT * FROM users WHERE EXTRACT(MONTH FROM created_at) = $1 AND EXTRACT(YEAR FROM created_at) = $2`;
    params = [monthNumber, year];
  } 
  else if (lowerQuery.includes('delete user with id')) {
    const match = query.match(/delete user with id (\d+)/i);
    if (!match) return res.status(400).json({ error: 'Invalid id in query' });
    const userId = match[1];
    sqlQuery = `DELETE FROM users WHERE user_id = $1 RETURNING *`;
    params = [userId];
  }
  else if (lowerQuery.includes('get the messages sent by')) {
    const match = query.match(/get the messages sent by (\w+)/i);
    if (!match) return res.status(400).json({ error: 'Invalid username in query' });
    const username = match[1];
    sqlQuery = `SELECT m.*, u.username AS sender FROM messages m JOIN users u ON m.sender_id = u.user_id WHERE u.username = $1`;
    params = [username];
  } else if (lowerQuery.includes('get the posts sent by')) {
    const match = query.match(/get the posts sent by (\w+)/i);
    if (!match) return res.status(400).json({ error: 'Invalid username in query' });
    const username = match[1];
    sqlQuery = `SELECT p.*, u.username FROM posts p JOIN users u ON p.user_id = u.user_id WHERE u.username = $1`;
    params = [username];
  } else if (lowerQuery.includes('get the comments sent by')) {
    const match = query.match(/get the comments sent by (\w+)/i);
    if (!match) return res.status(400).json({ error: 'Invalid username in query' });
    const username = match[1];
    sqlQuery = `SELECT c.*, u.username FROM comments c JOIN users u ON c.user_id = u.user_id WHERE u.username = $1`;
    params = [username];
  }
  else if (lowerQuery.includes('display all users')) {
    sqlQuery = `SELECT user_id, username, email, created_at FROM users ORDER BY user_id ASC`;
  }
  else {
    return res.status(400).json({ error: 'Unsupported query. Try: "display all users", "get the posts sent by <username>", or "get the details of user <username>"' });
  }

  try {
    const result = await pool.query(sqlQuery, params);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};