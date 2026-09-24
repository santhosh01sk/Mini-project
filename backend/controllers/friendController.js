const Friend = require("../models/friend");

const sendFriendRequest = async (req, res) => {
  const { senderId, receiverId } = req.body;
  try {
    const request = await Friend.sendFriendRequest(senderId, receiverId);
    res.status(201).json({ 
      message: `Friend request sent to ${request.targetUsername || 'user'}`, 
      request 
    });
  } catch (error) {
    res.status(500).json({ error: error.message || "Unable to send friend request" });
  }
};

const acceptFriendRequest = async (req, res) => {
  const { requestId } = req.body;
  try {
    const request = await Friend.acceptFriendRequest(requestId);
    res.status(200).json({ message: 'Friend request accepted', request });
  } catch (error) {
    res.status(500).json({ error: error.message || "Unable to accept friend request" });
  }
};

const rejectFriendRequest = async (req, res) => {
  const { requestId } = req.body;
  try {
    const request = await Friend.rejectFriendRequest(requestId);
    res.status(200).json({ message: 'Friend request rejected', request });
  } catch (error) {
    res.status(500).json({ error: error.message || "Unable to reject friend request" });
  }
};

const listFriends = async (req, res) => {
  const { userId } = req.params;
  try {
    const friends = await Friend.listFriends(userId);
    res.status(200).json(friends);
  } catch (error) {
    res.status(500).json({ error: error.message || "Unable to fetch friends" });
  }
};

const listFriendRequests = async (req, res) => {
  const { userId } = req.params;
  try {
    const requests = await Friend.listFriendRequests(userId);
    res.status(200).json(requests);
  } catch (error) {
    res.status(500).json({ error: error.message || "Unable to fetch friend requests" });
  }
};

const getDiscoverUsers = async (req, res) => {
  const { userId } = req.params;
  try {
    const users = await Friend.discoverUsers(userId);
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: error.message || "Unable to fetch discoverable users" });
  }
};

const getFriendPosts = async (req, res) => {
  const { userId } = req.params;
  try {
    const posts = await Friend.getFriendPosts(userId);
    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ error: error.message || "Unable to fetch friend posts" });
  }
};

module.exports = {
  sendFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  listFriends,
  listFriendRequests,
  getDiscoverUsers,
  getFriendPosts
};