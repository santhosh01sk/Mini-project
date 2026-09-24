const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { createUser, findUserByEmail, findUserByUsername } = require('../models/user');

const registerUser = async (req, res) => {
  const { username, email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    const existingUser = await findUserByEmail(email);

    if (existingUser) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    if (username && String(username).trim() !== '') {
      const existingUsername = await findUserByUsername(String(username).trim());
      if (existingUsername) {
        return res.status(400).json({ error: 'Username is already taken' });
      }
    }

    const newUser = await createUser(username, email, passwordHash);

    return res.status(201).json({ message: 'User registered successfully', user: newUser });
  } catch (error) {
    console.error('Error in registerUser:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};
const loginUser = async (req, res) => {
  const { email, password } = req.body;
  
  try {
      const user = await findUserByEmail(email);
      
      if (!user) {
          return res.status(401).json({ message: "Invalid email or password" });
      }
      
      const isMatch = await bcrypt.compare(password, user.password);
      
      if (!isMatch) {
          return res.status(401).json({ message: "Invalid email or password" });
      }
      
      const token = jwt.sign({ user_id: user.user_id, username: user.username }, 'login success', { expiresIn: '1h' });
      console.log("Generated Token",token);
      res.status(200).json({ 
        message: "Login successful", 
        token,
        user: {
          user_id: user.user_id,
          username: user.username,
          email: user.email,
          profile_img: user.profile_img
        }
      });
      
  } catch (error) {
      res.status(500).json({ message: "Error logging in", error });
  }
  
};
const loginAdmin = async (req, res) => {
  const { email, password } = req.body;

  const adminEmail = 'admin@gmail.com';
  const adminPassword = 'Admin123';

  if (email === adminEmail && password === adminPassword) {
    const token = jwt.sign({ role: 'admin', email: adminEmail, username: 'Administrator' }, 'login success', { expiresIn: '2h' });
    return res.status(200).json({ 
      message: 'Admin login successful',
      token,
      user: {
        user_id: 0,
        username: 'System Administrator',
        email: adminEmail,
        role: 'admin'
      }
    });
  } else {
    return res.status(401).json({ message: 'Invalid admin email or password' });
  }
};

module.exports = {
  registerUser,loginUser,loginAdmin
};
