import React, { useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import { fetchCommentsByPostId, addComment } from '../services/api';
import './Comment.css';
const Comment = ({ postId }) => {
  const getUserInfoFromToken = () => {
    const token = localStorage.getItem('token');
    if (!token) return { userId: null, username: '' };

    try {
      const decodedToken = jwtDecode(token);
      return {
        userId: decodedToken.user_id,
        username: decodedToken.username || `User ${decodedToken.user_id}`
      };
    } catch (error) {
      console.error("Failed to decode token", error);
      return { userId: null, username: '' };
    }
  };

  const { userId, username: currentUsername } = getUserInfoFromToken();
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [showComments, setShowComments] = useState(false);

  useEffect(() => {
    if (showComments) {
      fetchCommentsByPostId(postId)
        .then(data => setComments(data))
        .catch(error => console.error(error));
    }
  }, [postId, showComments]);

  const handleAddComment = (e) => {
    if (e) e.preventDefault();
    if (newComment.trim() === '') return;

    addComment(userId, postId, newComment)
      .then(data => {
        const commentWithUser = {
          ...data,
          username: data.username || currentUsername || `User ${userId}`
        };
        setComments([...comments, commentWithUser]);
        setNewComment('');
      })
      .catch(error => console.error(error));
  };

  return (
    <div className="comment-section">
      <button className="toggle-comments" onClick={() => setShowComments(!showComments)}>
        {showComments ? 'Hide Comments' : 'Show Comments'}
      </button>
      {showComments && (
        <div className="comments">
          <h3>Comments</h3>
          <ul>
            {comments.length === 0 ? (
              <li className="no-comments">No comments yet. Start the conversation!</li>
            ) : (
              comments.map(comment => (
                <li key={comment.id}>
                  <strong>{comment.username}</strong>: {comment.comment_text}
                </li>
              ))
            )}
          </ul>
          <form className="comment-form" onSubmit={handleAddComment}>
            <input
              type="text"
              value={newComment}
              onChange={e => setNewComment(e.target.value)}
              placeholder="Add a comment..."
            />
            <button type="submit">Comment</button>
          </form>
        </div>
      )}
    </div>
  );
};

export default Comment;