import React, { useEffect, useState } from 'react';
import {
  getFriends,
  getPendingRequests,
  sendFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  getMessages,
  sendMessage,
} from '../services/api.js';
import './Friend.css';
import './Chat.css';
import { jwtDecode } from 'jwt-decode';

const Friend = () => {
  const [receiverInput, setReceiverInput] = useState('');
  const [friends, setFriends] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState('');
  const [statusMessage, setStatusMessage] = useState('');

  const getUserIdFromToken = () => {
    const token = localStorage.getItem('token');
    if (!token) return null;

    try {
      const decodedToken = jwtDecode(token);
      return decodedToken.user_id;
    } catch (error) {
      console.error('Failed to decode token', error);
      return null;
    }
  };

  const fetchFriends = async () => {
    const userId = getUserIdFromToken();
    if (!userId) return;

    try {
      const friendsList = await getFriends(userId);
      setFriends(friendsList);
    } catch (error) {
      console.error('Error fetching friends:', error);
    }
  };

  const fetchPendingRequests = async () => {
    const userId = getUserIdFromToken();
    if (!userId) return;

    try {
      const requests = await getPendingRequests(userId);
      setPendingRequests(requests);
    } catch (error) {
      console.error('Error fetching pending requests:', error);
    }
  };

  const handleSendFriendRequest = async () => {
    const userId = getUserIdFromToken();
    if (!userId) return;

    try {
      if (!receiverInput.trim()) {
        setStatusMessage('Enter a username or user ID first.');
        return;
      }

      await sendFriendRequest(userId, receiverInput.trim());
      setReceiverInput('');
      setStatusMessage('Friend request sent.');
      fetchPendingRequests();
    } catch (error) {
      console.error('Error sending friend request:', error);
      setStatusMessage(error.response?.data?.error || error.message || 'Unable to send friend request.');
    }
  };

  const handleAcceptFriendRequest = async (requestId) => {
    try {
      await acceptFriendRequest(requestId);
      setStatusMessage('Friend request accepted.');
      fetchPendingRequests();
      fetchFriends();
    } catch (error) {
      console.error('Error accepting friend request:', error);
      setStatusMessage(error.response?.data?.error || error.message || 'Unable to accept request.');
    }
  };

  const handleRejectFriendRequest = async (requestId) => {
    try {
      await rejectFriendRequest(requestId);
      setStatusMessage('Friend request rejected.');
      fetchPendingRequests();
    } catch (error) {
      console.error('Error rejecting friend request:', error);
      setStatusMessage(error.response?.data?.error || error.message || 'Unable to reject request.');
    }
  };

  const fetchMessages = async (friendId) => {
    const userId = getUserIdFromToken();
    if (!userId) return;

    try {
      const conversation = await getMessages(userId, friendId);
      setMessages(conversation);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const handleSendMessage = async () => {
    const userId = getUserIdFromToken();
    if (!userId || !selectedFriend || !messageText.trim()) {
      return;
    }

    try {
      await sendMessage(userId, selectedFriend.user_id, messageText);
      setMessageText('');
      fetchMessages(selectedFriend.user_id);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const clearSelection = () => {
    setSelectedFriend(null);
    setMessages([]);
  };

  useEffect(() => {
    fetchPendingRequests();
    fetchFriends();
  }, []);

  useEffect(() => {
    if (selectedFriend) {
      fetchMessages(selectedFriend.user_id);
    }
  }, [selectedFriend]);

  return (
    <div className="friend-page">
      <div className="friend-hero">
        <div>
          <p className="eyebrow">Connections</p>
          <h1>Friends and messages in one place</h1>
          <p className="hero-copy">Send requests by username or user ID, review incoming requests, and chat with accepted friends.</p>
        </div>
        <button className="ghost-button" onClick={fetchFriends}>Refresh</button>
      </div>

      {statusMessage && <div className="status-banner">{statusMessage}</div>}

      <div className="friend-grid">
        <section className="panel panel-accent">
          <h2>Send friend request</h2>
          <div className="send-request">
            <input
              type="text"
              placeholder="Enter username or user ID"
              value={receiverInput}
              onChange={(e) => setReceiverInput(e.target.value)}
            />
            <button onClick={handleSendFriendRequest}>Send Request</button>
          </div>
          <p className="hint-text">If usernames are missing, use the numeric user ID.</p>
        </section>

        <section className="panel">
          <h2>Pending requests</h2>
          <ul className="pending-requests">
            {pendingRequests.length === 0 && <li className="empty-state">No pending requests.</li>}
            {pendingRequests.map((request) => (
              <li key={request.id} className="request-item">
                <div>
                  <strong>{request.sender}</strong>
                  <span>Request #{request.id}</span>
                </div>
                <div className="request-actions">
                  <button onClick={() => handleAcceptFriendRequest(request.id)} className="accept-button">Accept</button>
                  <button onClick={() => handleRejectFriendRequest(request.id)} className="reject-button">Reject</button>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section className="panel">
          <h2>Friends</h2>
          <ul className="friends-list">
            {friends.length === 0 && <li className="empty-state">No friends yet.</li>}
            {friends.map((friend) => (
              <li
                key={friend.user_id}
                className={`friend-item ${selectedFriend?.user_id === friend.user_id ? 'active' : ''}`}
                onClick={() => setSelectedFriend(friend)}
              >
                <div>
                  <strong>{friend.username || `User ${friend.user_id}`}</strong>
                  <span>ID {friend.user_id}</span>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>

      {selectedFriend && (
        <div className="chat-container">
          <div className="chat-header">
            <div>
              <p className="eyebrow">Conversation</p>
              <h2>Chat with {selectedFriend.username}</h2>
            </div>
            <button className="ghost-button" onClick={clearSelection}>Close</button>
          </div>

          <div className="messages">
            {messages.length === 0 && <div className="empty-state">No messages yet.</div>}
            {messages.map((message) => (
              <div
                key={message.id}
                className={`message ${message.sender_id === getUserIdFromToken() ? 'sent' : 'received'}`}
              >
                <p>{message.message_text}</p>
                <span>{new Date(message.created_at).toLocaleTimeString()}</span>
              </div>
            ))}
          </div>

          <div className="send-message">
            <input
              type="text"
              placeholder="Type a message"
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
            />
            <button onClick={handleSendMessage}>Send</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Friend;
