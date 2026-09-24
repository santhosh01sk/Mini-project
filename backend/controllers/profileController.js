const bcrypt = require("bcrypt");
const pool = require("../config/db");
const User = require("../models/profile");

const getProfile = async (req, res) => {
  const { userId } = req.params;
  try {
    const result = await pool.query(
      "SELECT user_id, username, email, profile_img, created_at FROM users WHERE user_id = $1",
      [userId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).json({ error: "Error fetching user profile" });
  }
};

const updateProfile = async (req, res) => {
  const { user_id } = req.body;
  const { username, email, password } = req.body;
  const profileImage = req.file ? req.file.filename : null;

  try {
    const fieldsToUpdate = {};
    if (username && username.trim() !== '') fieldsToUpdate.username = username.trim();
    if (email && email.trim() !== '') fieldsToUpdate.email = email.trim();
    if (profileImage) fieldsToUpdate.profile_img = profileImage;
    if (password && password.trim() !== '') fieldsToUpdate.password = await bcrypt.hash(password, 10);

    const updatedUser = await User.updateUser(user_id, fieldsToUpdate);
    if (updatedUser) {
      delete updatedUser.password;
      res.json({ message: "Profile updated successfully", user: updatedUser });
    } else {
      res.status(404).json({ error: "User not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error updating profile" });
  }
};

module.exports = {
  getProfile,
  updateProfile,
};

