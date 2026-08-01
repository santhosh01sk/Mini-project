const pool = require('../config/db');
const { findUserByUsername } = require('./user');

const resolveReceiverId = async (receiverIdentifier) => {
  if (receiverIdentifier === null || receiverIdentifier === undefined || receiverIdentifier === '') {
    throw new Error('Receiver is required');
  }

  const normalized = String(receiverIdentifier).trim();
  const numericReceiverId = Number(normalized);
  if (!Number.isNaN(numericReceiverId) && String(numericReceiverId) === normalized) {
    return numericReceiverId;
  }

  const user = await findUserByUsername(normalized);
  if (!user) {
    throw new Error('User not found');
  }

  return user.user_id;
};

exports.sendFriendRequest = async (senderId, receiverIdentifier) => {
  try {
    const receiverId = await resolveReceiverId(receiverIdentifier);

    if (Number(senderId) === Number(receiverId)) {
      throw new Error('You cannot send a friend request to yourself');
    }

    const result = await pool.query(
      'INSERT INTO friend_requests (sender_id, receiver_id, status) VALUES ($1, $2, $3) RETURNING *',
      [senderId, receiverId, 'pending']
    );
    return result.rows[0];
  } catch (error) {
    throw new Error(error.message);
  }
};

exports.acceptFriendRequest = async (requestId) => {
    try {
      await pool.query('BEGIN');

      const requestResult = await pool.query(
        'SELECT * FROM friend_requests WHERE id = $1 FOR UPDATE',
        [requestId]
      );
      const acceptedRequest = requestResult.rows[0];

      if (!acceptedRequest) {
        throw new Error('Friend request not found');
      }

      if (acceptedRequest.status !== 'pending') {
        throw new Error('Friend request is already processed');
      }

      await pool.query(
        'UPDATE friend_requests SET status = $1 WHERE id = $2',
        ['accepted', requestId]
      );
  
      const { sender_id, receiver_id } = acceptedRequest;
  
      await pool.query(
        'INSERT INTO friends (user_id, friend_id) VALUES ($1, $2), ($2, $1) ON CONFLICT DO NOTHING',
        [sender_id, receiver_id]
      );
  
      await pool.query('COMMIT');
  
      return acceptedRequest;
    } catch (error) {
      await pool.query('ROLLBACK');
      throw new Error(error.message);
    }
  };

exports.rejectFriendRequest = async (requestId) => {
  try {
    const result = await pool.query(
      'UPDATE friend_requests SET status = $1 WHERE id = $2 RETURNING *',
      ['rejected', requestId]
    );
    return result.rows[0];
  } catch (error) {
    throw new Error(error.message);
  }
};

exports.listFriends = async (userId) => {
  try {
    const result = await pool.query(
      `SELECT users.user_id, users.username FROM users
       JOIN friends ON users.user_id = friends.friend_id
       WHERE friends.user_id = $1 `,
      [userId]
    );
    return result.rows;
  } catch (error) {
    throw new Error(error.message);
  }
};

exports.listFriendRequests = async (userId) => {
  try {
    const result = await pool.query(
      `SELECT friend_requests.id, friend_requests.sender_id, friend_requests.receiver_id, users.username AS sender FROM friend_requests
       JOIN users ON friend_requests.sender_id = users.user_id
       WHERE friend_requests.receiver_id = $1 AND friend_requests.status = 'pending'`,
      [userId]
    );
    return result.rows;
  } catch (error) {
    throw new Error(error.message);
  }
};
exports.getFriendPosts = async (userId) => {
  try {
    const result = await pool.query(
      `SELECT posts.*, users.username, users.profile_img FROM posts
       JOIN users ON posts.user_id = users.user_id
       WHERE posts.user_id = $1
       UNION
       SELECT posts.*, users.username, users.profile_img FROM posts
       JOIN friends ON posts.user_id = friends.friend_id
       JOIN users ON posts.user_id = users.user_id
       WHERE friends.user_id = $1
       ORDER BY created_at DESC`,
      [userId]
    );
    return result.rows;
  } catch (error) {
    throw new Error(error.message);
  }
};