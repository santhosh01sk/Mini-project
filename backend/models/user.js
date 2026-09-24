const pool = require('../config/db');

const createUser = async (username, email, passwordHash) => {
  const cleanUsername = username && String(username).trim() !== '' 
    ? String(username).trim() 
    : (email ? email.split('@')[0] : 'user');

  const result = await pool.query(
    'INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING user_id, username, email, profile_img, created_at',
    [cleanUsername, email, passwordHash]
  );
  return result.rows[0];
};

const findUserByEmail = async (email) => {
  try {
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    return result.rows[0];
  } catch (error) {
    console.error('Error finding user by email:', error);
    throw error;
  }
};

const findUserByUsername = async (username) => {
  try {
    const result = await pool.query(
      'SELECT * FROM users WHERE LOWER(username) = LOWER($1)',
      [username]
    );
    return result.rows[0];
  } catch (error) {
    console.error('Error finding user by username:', error);
    throw error;
  }
};

module.exports = {
  createUser,
  findUserByEmail,
  findUserByUsername
};

