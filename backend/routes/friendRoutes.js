const express = require('express');
const router = express.Router();
const friendController = require('../controllers/friendController');
const messageController = require('../controllers/messageController');

router.post('/friend-request', friendController.sendFriendRequest);
router.post('/accept-friend', friendController.acceptFriendRequest);
router.post('/reject-friend', friendController.rejectFriendRequest);
router.get('/pending-requests/:userId', friendController.listFriendRequests);
router.get('/friend-posts/:userId', friendController.getFriendPosts);
router.get('/discover/:userId', friendController.getDiscoverUsers);
router.get('/:userId', friendController.listFriends);
router.post('/messages/send', messageController.sendMessage);
router.get('/messages/:userId/:friendId', messageController.getMessages);
module.exports = router;