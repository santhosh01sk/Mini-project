import React from 'react';
import './Post.css';
import { deletePost } from '../services/api';

function Post({ userId,post, onDelete }) {
  const fallbackAvatar = '/default-avatar.svg';
  const profileImage = post.profile_img ? `http://localhost:5000/uploads/${post.profile_img}` : fallbackAvatar;

  //console.log(post.id);
  const handleDelete = async () => {
    try {
      await deletePost(post.id);
      onDelete(post.id);
    } catch (error) {
      console.error('Error deleting post:', error);
    }
  };

  return (
    <div className="post">
      <div className="post-header">
        <img
          src={profileImage}
          onError={(event) => {
            event.currentTarget.src = fallbackAvatar;
          }}
          alt="Profile"
          className="profile-img"
        />
        <div className="user-info">
          <h3>{post.username}</h3>
        </div>
        {userId === post.user_id && (
          <button onClick={handleDelete} className="delete-button">Delete</button>
        )}
      </div>
      <div className="post-content">
        <p>{post.caption}</p>
        {post.image_url && <img src={`http://localhost:5000/uploads/${post.image_url}`} alt="Post" />}
      </div>
    </div>
  );
}

export default Post;