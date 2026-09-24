import React, { useEffect, useState } from 'react';
import {
  getFriends,
  getPendingRequests,
  getDiscoverUsers,
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
  const [discoverUsers, setDiscoverUsers] = useState([]);
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

  const fetchDiscoverUsers = async () => {
    const userId = getUserIdFromToken();
    if (!userId) return;

    try {
      const users = await getDiscoverUsers(userId);
      setDiscoverUsers(users);
    } catch (error) {
      console.error('Error fetching discoverable users:', error);
    }
  };

  const handleSendFriendRequest = async (targetIdentifier) => {
    const userId = getUserIdFromToken();
    if (!userId) return;

    const identifier = targetIdentifier || receiverInput.trim();
    if (!identifier) {
      setStatusMessage('Enter a username or user ID first.');
      return;
    }

    try {
      const res = await sendFriendRequest(userId, identifier);
      setReceiverInput('');
      setStatusMessage(res.message || `Friend request sent to ${identifier}!`);
      fetchPendingRequests();
      fetchDiscoverUsers();
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
      fetchDiscoverUsers();
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
      fetchDiscoverUsers();
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

  const refreshAll = () => {
    fetchPendingRequests();
    fetchFriends();
    fetchDiscoverUsers();
  };

  useEffect(() => {
    refreshAll();
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
          <p className="hero-copy">Send requests by username, discover people to connect with, and chat with your friends.</p>
        </div>
        <button className="ghost-button" onClick={refreshAll}>Refresh</button>
      </div>

      {statusMessage && <div className="status-banner">{statusMessage}</div>}

      <div className="friend-grid">
        {/* PANEL 1: SEND FRIEND REQUEST & DISCOVER */}
        <section className="panel panel-accent">
          <h2>Send friend request</h2>
          <div className="send-request">
            <input
              type="text"
              placeholder="Enter username (e.g. alex)"
              value={receiverInput}
              onChange={(e) => setReceiverInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendFriendRequest()}
            />
            <button onClick={() => handleSendFriendRequest()}>Send</button>
          </div>

          <div className="discover-section">
            <p className="sub-heading">Suggested people to connect with:</p>
            {discoverUsers.length === 0 ? (
              <p className="hint-text">No new users to add right now.</p>
            ) : (
              <ul className="discover-list">
                {discoverUsers.map((user) => (
                  <li key={user.user_id} className="discover-item">
                    <div className="discover-info">
                      <strong>{user.username}</strong>
                      <span>{user.email}</span>
                    </div>
                    <button
                      className="connect-button"
                      onClick={() => handleSendFriendRequest(user.username)}
                    >
                      Connect
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        {/* PANEL 2: PENDING REQUESTS */}
        <section className="panel">
          <h2>Pending requests ({pendingRequests.length})</h2>
          <ul className="pending-requests">
            {pendingRequests.length === 0 && <li className="empty-state">No pending requests.</li>}
            {pendingRequests.map((request) => (
              <li key={request.id} className="request-item">
                <div className="request-info">
                  <strong className="username-badge">{request.sender}</strong>
                  <span>{request.sender_email || `User #${request.sender_id}`} wants to connect</span>
                </div>
                <div className="request-actions">
                  <button onClick={() => handleAcceptFriendRequest(request.id)} className="accept-button">Accept</button>
                  <button onClick={() => handleRejectFriendRequest(request.id)} className="reject-button">Reject</button>
                </div>
              </li>
            ))}
          </ul>
        </section>

        {/* PANEL 3: FRIENDS LIST */}
        <section className="panel">
          <h2>Friends ({friends.length})</h2>
          <ul className="friends-list">
            {friends.length === 0 && <li className="empty-state">No friends yet.</li>}
            {friends.map((friend) => (
              <li
                key={friend.user_id}
                className={`friend-item ${selectedFriend?.user_id === friend.user_id ? 'active' : ''}`}
                onClick={() => setSelectedFriend(friend)}
              >
                <div className="friend-info">
                  <strong className="username-badge">{friend.username}</strong>
                  <span>{friend.email || `ID: ${friend.user_id}`}</span>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>

      {/* CHAT CONTAINER */}
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
            {messages.length === 0 && <div className="empty-state">No messages yet. Say hello to {selectedFriend.username}!</div>}
            {messages.map((message) => {
              const isMe = message.sender_id === getUserIdFromToken();
              return (
                <div
                  key={message.id}
                  className={`message ${isMe ? 'sent' : 'received'}`}
                >
                  <span className="message-sender">{isMe ? 'You' : (message.sender_name || selectedFriend.username)}</span>
                  <p>{message.message_text}</p>
                  <span className="message-time">{new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              );
            })}
          </div>

          <div className="send-message">
            <input
              type="text"
              placeholder={`Message ${selectedFriend.username}...`}
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            />
            <button onClick={handleSendMessage}>Send</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Friend;

