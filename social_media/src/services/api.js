import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000',
});
// export const getConversations = async (userId) => {
//   try {
//     const response = await api.get(`/api/conversations/user/${userId}`);
//     return response.data;
//   } catch (error) {
//     console.error("Failed to get conversations");
//     throw error;
//   }
// };

// export const getConversation = async (userId1, userId2) => {
//   try {
//     const response = await api.get(`/api/conversations/${userId1}/${userId2}`);
//     return response.data;
//   } catch (error) {
//     console.error("Failed to get conversation");
//     throw error;
//   }
// };

// export const sendMessage = async (messageData) => {
//   try {
//     const response = await api.post(`/api/conversations/send`, messageData);
//     return response.data;
//   } catch (error) {
//     console.error("Failed to send message");
//     throw error;
//   }
// };
export const getPosts = async () =>{
    try{
        const response = await api.get("/api/posts/posts");
        return response.data;
    }
    catch(error){
        console.error("Failed to get posts");
        throw error;
    }
}
export const createPost = async (formData) => {
    try {
      const response = await api.post("/api/posts/create", formData);
      return response.data;
    } catch (error) {
      console.error("Failed to create post");
      throw error;
    }
  };
export const registerUser = (data) => api.post('/api/auth/register', data);
export const loginUser = async (email, password) => {
  try {
      const response = await fetch(`http://localhost:5000/api/auth/login`, {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, password }),
      });
      
      if (!response.ok) {
          throw new Error('Login failed');
      }
      
      const data = await response.json();
      return data; 
  } catch (error) {
      console.error("Login error:", error);
      throw error;
  }
};
export const loginAdmin = async (email, password) => {
  try {
    const response = await fetch(`http://localhost:5000/api/auth/admin-login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      throw new Error('Admin login failed');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Admin login error:", error);
    throw error;
  }
};
export const getProfile = async (userId) => {
  try {
    const response = await api.get(`/api/profile/${userId}`);
    return response.data;
  } catch (error) {
    console.error("Failed to fetch profile");
    throw error;
  }
};

export const updateProfile = async (formData) => {
  try {
    const response = await api.put(`/api/profile/update`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  } catch (error) {
    console.error("Failed to update profile");
    throw error;
  }
};
export const sendFriendRequest = async (senderId, receiverId) => {
  try {
    const response = await api.post('/api/friends/friend-request', {
      senderId,
      receiverId,
    });
    return response.data;
  } catch (error) {
    console.error('Error sending friend request:', error);
    throw error;
  }
};
export const acceptFriendRequest = async (requestId) => {
  try {
    console.log(requestId);
    const response = await api.post('/api/friends/accept-friend', { requestId });
    return response.data;
  } catch (error) {
    console.error('Error accepting friend request:', error);
    throw error;
  }
};

export const rejectFriendRequest = async (requestId) => {
  try {
    const response = await api.post('/api/friends/reject-friend', { requestId });
    return response.data;
  } catch (error) {
    console.error('Error rejecting friend request:', error);
    throw error;
  }
};

export const getPendingRequests = async (userId) => {
  try {
    const response = await api.get(`/api/friends/pending-requests/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching pending requests:', error);
    throw error;
  }
};

export const getFriends = async (userId) => {
  try {
    const response = await api.get(`/api/friends/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching friends:', error);
    throw error;
  }
};

export const getDiscoverUsers = async (userId) => {
  try {
    const response = await api.get(`/api/friends/discover/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching discoverable users:', error);
    throw error;
  }
};
export const getMessages = async (userId, friendId) => {
  try {
    const response = await api.get(`/api/messages/${userId}/${friendId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching messages:', error);
    throw error;
  }
};
export const sendMessage = async (senderId, receiverId, messageText) => {
  try {
    const response = await api.post('/api/messages/send', {
      senderId,
      receiverId,
      messageText,
    });
    return response.data;
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
};
export const getFriendPosts = async (userId) => {
  try {
    console.log("Hiiii");
    const response = await api.get(`/api/friends/friend-posts/${userId}`);
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching friend posts:", error);
    throw error;
  }
};
export const fetchCommentsByPostId = async (postId) => {
  try {
    const response = await api.get(`/api/comments/${postId}`);
    return response.data;
  } catch (error) {
    console.error("Failed to fetch comments:", error);
    throw error;
  }
};
export const addComment = async (userId,postId, commentText) => {
  try {
    const response = await api.post('/api/comments/comments', { userId, postId, commentText });
    return response.data;
  } catch (error) {
    console.error("Failed to add comment:", error);
    throw error;
  }
};
export const toggleLike = async (userId,postId) => {
  try {
    const response = await api.post('/api/likes/toggle', { userId,postId });
    return response.data;
  } catch (error) {
    console.error("Failed to toggle like:", error);
    throw error;
  }
};
export const getLikesCount = async (postId) => {
  try {
    const response = await api.get(`/api/likes/count/${postId}`);
    return response.data.count;
  } catch (error) {
    console.error("Failed to fetch likes count:", error);
    throw error;
  }
};
export const deletePost = async (postId) => {
  //console.log(postId);
  try {
    const response = await api.delete(`/api/posts/${postId}`);
    return response.data;
  } catch (error) {
    console.error("Failed to delete post:", error);
    throw error;
  }
};

export const getAdminOverview = async () => {
  try {
    const response = await api.get('/api/admin/users-overview');
    return response.data;
  } catch (error) {
    console.error("Failed to fetch admin overview:", error);
    throw error;
  }
};

export const getAdminLogs = async () => {
  try {
    const response = await api.get('/api/admin/logs');
    return response.data;
  } catch (error) {
    console.error("Failed to fetch admin logs:", error);
    throw error;
  }
};

export const executeAdminQuery = async (query) => {
  try {
    const response = await api.post('/api/admin/query', { query });
    return response.data;
  } catch (error) {
    console.error("Failed to execute admin query:", error);
    throw error;
  }
};

