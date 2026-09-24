import React, { useRef, useState } from 'react';
import './Feed.css';
import { jwtDecode } from 'jwt-decode';
import axios from "axios";
import { useNavigate } from 'react-router-dom';

const getUserIdFromToken = () => {
  const token = localStorage.getItem('token');
  if (!token) return null;

  try {
    const decodedToken = jwtDecode(token);
    return decodedToken.user_id; 
  } catch (error) {
    console.error("Failed to decode token", error);
    return null;
  }
};

function Feed() {
  const [preview, setPreview] = useState("");
  const userId = getUserIdFromToken();
  const [caption, setCaption] = useState("");
  const [file, setFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!caption.trim()) {
      setErrorMessage('Please write a caption before posting.');
      return;
    }

    if (!file) {
      setErrorMessage('Please choose an image to post.');
      return;
    }

    const formData = new FormData();
    formData.append('caption', caption.trim());
    formData.append('image', file);
    formData.append('user_id', userId);

    try {
      setIsSubmitting(true);
      await axios.post('http://localhost:5000/api/posts/create', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setCaption('');
      setFile(null);
      setPreview('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      navigate('/home');
    } catch (error) {
      console.error('Error creating post ', error);
      setErrorMessage('Failed to create post. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      const reader = new FileReader();
      reader.onload = (event) => {
        setPreview(event.target.result);
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const handleCaptionChange = (e) => {
    setCaption(e.target.value);
  };

  return (
    <div className="composer-page">
      <div className="composer-shell">
        <div className="composer-card">
          <div className="composer-header">
            <p className="composer-kicker">Create</p>
            <h2>Share a new post</h2>
            <p>Drop an image and write a short caption for your friends.</p>
          </div>

          <form onSubmit={handleSubmit} className="composer-form">
            <label className="composer-field">
              <span>Caption</span>
              <textarea
                value={caption}
                maxLength={280}
                placeholder="What's happening today?"
                onChange={handleCaptionChange}
              />
              <small>{caption.length}/280</small>
            </label>

            <label htmlFor="file-upload" className="file-upload-label">
              <span className="file-upload-text">Choose image</span>
              <input
                ref={fileInputRef}
                onChange={handleFileChange}
                id="file-upload"
                className="file-upload-input"
                type="file"
                accept="image/*"
              />
            </label>

            {preview && (
              <div className="preview-shell">
                <img src={preview} alt="Post preview" className="composer-preview" />
              </div>
            )}

            {errorMessage && <div className="composer-error">{errorMessage}</div>}

            <div className="composer-actions">
              <button
                type="button"
                className="secondary-button"
                onClick={() => navigate('/home')}
              >
                Cancel
              </button>
              <button className="post-button" type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Posting...' : 'Post now'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Feed;
